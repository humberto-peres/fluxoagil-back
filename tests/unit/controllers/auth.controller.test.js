const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

const mockPrismaClient = {
  user: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrismaClient),
}));

const authController = require('../../../src/controllers/auth.controller');

describe('Auth Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      cookies: {},
      user: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      cookie: jest.fn().mockReturnThis(),
      clearCookie: jest.fn().mockReturnThis(),
    };

    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_EXPIRES = '7d';
    process.env.NODE_ENV = 'test';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    const mockUser = {
      id: 1,
      name: 'John Doe',
      username: 'johndoe',
      email: 'john@example.com',
      password: '$2b$10$hashedpassword',
      role: 'user',
    };

    test('deve fazer login com credenciais válidas', async () => {
      req.body = { username: 'johndoe', password: 'password123' };

      mockPrismaClient.user.findUnique.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('mock-jwt-token');

      await authController.login(req, res);

      expect(mockPrismaClient.user.findUnique).toHaveBeenCalledWith({
        where: { username: 'johndoe' },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', mockUser.password);
      expect(jwt.sign).toHaveBeenCalledWith(
        {
          id: mockUser.id,
          role: mockUser.role,
          name: mockUser.name,
          username: mockUser.username,
        },
        'test-secret',
        { expiresIn: '7d' }
      );
      expect(res.cookie).toHaveBeenCalledWith('token', 'mock-jwt-token', {
        httpOnly: true,
        sameSite: 'lax',
        secure: false,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/',
      });
      expect(res.json).toHaveBeenCalledWith({
        id: mockUser.id,
        name: mockUser.name,
        username: mockUser.username,
        email: mockUser.email,
        role: mockUser.role,
      });
    });

    test('deve retornar 400 quando username não for fornecido', async () => {
      req.body = { password: 'password123' };

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Credenciais inválidas',
      });
      expect(mockPrismaClient.user.findUnique).not.toHaveBeenCalled();
    });

    test('deve retornar 400 quando password não for fornecido', async () => {
      req.body = { username: 'johndoe' };

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Credenciais inválidas',
      });
      expect(mockPrismaClient.user.findUnique).not.toHaveBeenCalled();
    });

    test('deve retornar 400 quando body estiver vazio', async () => {
      req.body = {};

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Credenciais inválidas',
      });
    });

    test('deve retornar 401 quando usuário não existir', async () => {
      req.body = { username: 'nonexistent', password: 'password123' };
      mockPrismaClient.user.findUnique.mockResolvedValue(null);

      await authController.login(req, res);

      expect(mockPrismaClient.user.findUnique).toHaveBeenCalledWith({
        where: { username: 'nonexistent' },
      });
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Usuário/senha inválidos',
      });
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    test('deve retornar 401 quando senha estiver incorreta', async () => {
      req.body = { username: 'johndoe', password: 'wrongpassword' };
      mockPrismaClient.user.findUnique.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);

      await authController.login(req, res);

      expect(bcrypt.compare).toHaveBeenCalledWith('wrongpassword', mockUser.password);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Usuário/senha inválidos',
      });
      expect(jwt.sign).not.toHaveBeenCalled();
      expect(res.cookie).not.toHaveBeenCalled();
    });

    test('deve usar secure: true em produção', async () => {
      process.env.NODE_ENV = 'production';
      req.body = { username: 'johndoe', password: 'password123' };

      mockPrismaClient.user.findUnique.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('mock-jwt-token');

      await authController.login(req, res);

      expect(res.cookie).toHaveBeenCalledWith('token', 'mock-jwt-token', {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/',
      });
    });

    test('deve tratar erro do banco de dados', async () => {
      req.body = { username: 'johndoe', password: 'password123' };
      mockPrismaClient.user.findUnique.mockRejectedValue(new Error('Database error'));

      await expect(authController.login(req, res)).rejects.toThrow('Database error');
    });
  });

  describe('me', () => {
    test('deve retornar dados do usuário autenticado', async () => {
      const mockUser = {
        id: 1,
        name: 'John Doe',
        username: 'johndoe',
        email: 'john@example.com',
        role: 'user',
      };

      req.user = { id: 1 };
      mockPrismaClient.user.findUnique.mockResolvedValue(mockUser);

      await authController.me(req, res);

      expect(mockPrismaClient.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
          role: true,
        },
      });
      expect(res.json).toHaveBeenCalledWith(mockUser);
    });

    test('deve retornar null quando usuário não for encontrado', async () => {
      req.user = { id: 999 };
      mockPrismaClient.user.findUnique.mockResolvedValue(null);

      await authController.me(req, res);

      expect(res.json).toHaveBeenCalledWith(null);
    });

    test('deve tratar erro do banco de dados', async () => {
      req.user = { id: 1 };
      mockPrismaClient.user.findUnique.mockRejectedValue(new Error('Database error'));

      await expect(authController.me(req, res)).rejects.toThrow('Database error');
    });
  });

  describe('logout', () => {
    test('deve fazer logout e limpar cookie', async () => {
      await authController.logout(req, res);

      expect(res.clearCookie).toHaveBeenCalledWith('token', {
        httpOnly: true,
        sameSite: 'lax',
        secure: false,
        path: '/',
      });
      expect(res.json).toHaveBeenCalledWith({ message: 'OK' });
    });

    test('deve usar secure: true em produção', async () => {
      process.env.NODE_ENV = 'production';

      await authController.logout(req, res);

      expect(res.clearCookie).toHaveBeenCalledWith('token', {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
        path: '/',
      });
    });
  });
});