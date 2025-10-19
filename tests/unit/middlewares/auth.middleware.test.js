const jwt = require('jsonwebtoken');
const { authRequired, requireRole } = require('../../../src/middlewares/auth');

jest.mock('jsonwebtoken');

describe('Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      cookies: {},
      user: null,
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
    
    process.env.JWT_SECRET = 'test-secret';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('authRequired', () => {
    test('deve permitir acesso com token válido', () => {
      const mockPayload = { id: 1, role: 'user', name: 'John', username: 'johndoe' };
      req.cookies.token = 'valid-token';
      jwt.verify.mockReturnValue(mockPayload);

      authRequired(req, res, next);

      expect(jwt.verify).toHaveBeenCalledWith('valid-token', 'test-secret');
      expect(req.user).toEqual(mockPayload);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('deve retornar 401 quando token não estiver presente', () => {
      req.cookies = {};

      authRequired(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Não autenticado' });
      expect(next).not.toHaveBeenCalled();
      expect(jwt.verify).not.toHaveBeenCalled();
    });

    test('deve retornar 401 quando cookies estiver undefined', () => {
      req.cookies = undefined;

      authRequired(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Não autenticado' });
      expect(next).not.toHaveBeenCalled();
    });

    test('deve retornar 401 quando token for inválido', () => {
      req.cookies.token = 'invalid-token';
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      authRequired(req, res, next);

      expect(jwt.verify).toHaveBeenCalledWith('invalid-token', 'test-secret');
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Token inválido' });
      expect(next).not.toHaveBeenCalled();
    });

    test('deve retornar 401 quando token expirar', () => {
      req.cookies.token = 'expired-token';
      jwt.verify.mockImplementation(() => {
        throw new jwt.TokenExpiredError('Token expired', new Date());
      });

      authRequired(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Token inválido' });
      expect(next).not.toHaveBeenCalled();
    });

    test('deve retornar 401 para qualquer erro de verificação', () => {
      req.cookies.token = 'malformed-token';
      jwt.verify.mockImplementation(() => {
        throw new Error('Malformed token');
      });

      authRequired(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Token inválido' });
    });
  });

  describe('requireRole', () => {
    test('deve permitir acesso quando usuário tem role permitida', () => {
      req.user = { id: 1, role: 'admin' };
      const middleware = requireRole('admin', 'user');

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('deve permitir acesso com múltiplas roles', () => {
      req.user = { id: 1, role: 'user' };
      const middleware = requireRole('admin', 'user', 'moderator');

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    test('deve retornar 403 quando usuário não tem role permitida', () => {
      req.user = { id: 1, role: 'user' };
      const middleware = requireRole('admin');

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Acesso negado' });
      expect(next).not.toHaveBeenCalled();
    });

    test('deve retornar 401 quando req.user não existir', () => {
      req.user = null;
      const middleware = requireRole('admin');

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Não autenticado' });
      expect(next).not.toHaveBeenCalled();
    });

    test('deve retornar 401 quando req.user for undefined', () => {
      const middleware = requireRole('admin');

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Não autenticado' });
    });

    test('deve funcionar com uma única role', () => {
      req.user = { id: 1, role: 'admin' };
      const middleware = requireRole('admin');

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    test('deve ser case-sensitive nas roles', () => {
      req.user = { id: 1, role: 'Admin' };
      const middleware = requireRole('admin');

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });
  });
});