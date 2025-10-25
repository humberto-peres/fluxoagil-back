const request = require('supertest');
const express = require('express');
const cookieParser = require('cookie-parser');
const authRoutes = require('../../../src/routes/auth.routes');
const authController = require('../../../src/controllers/auth.controller');
const { authRequired } = require('../../../src/middlewares/auth');

jest.mock('../../../src/controllers/auth.controller');
jest.mock('../../../src/middlewares/auth');

describe('Auth Routes', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use(cookieParser());
    app.use('/auth', authRoutes);

    authRequired.mockImplementation((req, res, next) => {
      req.user = { id: 1, role: 'user' };
      next();
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /auth/login', () => {
    test('deve chamar controller de login', async () => {
      authController.login.mockImplementation((req, res) => {
        res.json({ success: true });
      });

      const response = await request(app)
        .post('/auth/login')
        .send({ username: 'johndoe', password: 'password123' });

      expect(authController.login).toHaveBeenCalled();
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true });
    });

    test('deve aceitar JSON no body', async () => {
      authController.login.mockImplementation((req, res) => {
        res.json({ username: req.body.username });
      });

      const response = await request(app)
        .post('/auth/login')
        .send({ username: 'test', password: 'pass' })
        .set('Content-Type', 'application/json');

      expect(response.body).toEqual({ username: 'test' });
    });
  });

  describe('GET /auth/me', () => {
    test('deve chamar middleware authRequired', async () => {
      authController.me.mockImplementation((req, res) => {
        res.json({ id: req.user.id });
      });

      const response = await request(app).get('/auth/me');

      expect(authRequired).toHaveBeenCalled();
      expect(authController.me).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });

    test('deve retornar dados do usuário autenticado', async () => {
      authController.me.mockImplementation((req, res) => {
        res.json({ id: 1, name: 'John' });
      });

      const response = await request(app).get('/auth/me');

      expect(response.body).toEqual({ id: 1, name: 'John' });
    });

    test('deve bloquear quando não autenticado', async () => {
      authRequired.mockImplementation((req, res) => {
        res.status(401).json({ message: 'Não autenticado' });
      });

      const response = await request(app).get('/auth/me');

      expect(response.status).toBe(401);
      expect(authController.me).not.toHaveBeenCalled();
    });
  });

  describe('POST /auth/logout', () => {
    test('deve chamar middleware authRequired', async () => {
      authController.logout.mockImplementation((req, res) => {
        res.json({ message: 'OK' });
      });

      const response = await request(app).post('/auth/logout');

      expect(authRequired).toHaveBeenCalled();
      expect(authController.logout).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });

    test('deve fazer logout com sucesso', async () => {
      authController.logout.mockImplementation((req, res) => {
        res.json({ message: 'OK' });
      });

      const response = await request(app).post('/auth/logout');

      expect(response.body).toEqual({ message: 'OK' });
    });

    test('deve bloquear quando não autenticado', async () => {
      authRequired.mockImplementation((req, res) => {
        res.status(401).json({ message: 'Não autenticado' });
      });

      const response = await request(app).post('/auth/logout');

      expect(response.status).toBe(401);
      expect(authController.logout).not.toHaveBeenCalled();
    });
  });
});