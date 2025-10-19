const request = require('supertest');
const express = require('express');
const userRoutes = require('../../../src/routes/user.routes');
const userController = require('../../../src/controllers/user.controller');

jest.mock('../../../src/controllers/user.controller');

describe('User Routes', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/users', userRoutes);
    jest.clearAllMocks();
  });

  describe('GET /users', () => {
    test('deve chamar controller getAll', async () => {
      userController.getAll.mockImplementation((req, res) => {
        res.json([]);
      });

      const response = await request(app).get('/users');

      expect(userController.getAll).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });

    test('deve retornar lista de usuários', async () => {
      const mockUsers = [
        { id: 1, name: 'João', email: 'joao@test.com' },
        { id: 2, name: 'Maria', email: 'maria@test.com' },
      ];
      userController.getAll.mockImplementation((req, res) => {
        res.json(mockUsers);
      });

      const response = await request(app).get('/users');

      expect(response.body).toEqual(mockUsers);
    });
  });

  describe('GET /users/:id', () => {
    test('deve chamar controller getById', async () => {
      userController.getById.mockImplementation((req, res) => {
        res.json({ id: 1 });
      });

      const response = await request(app).get('/users/1');

      expect(userController.getById).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });

    test('deve passar id correto', async () => {
      userController.getById.mockImplementation((req, res) => {
        res.json({ id: parseInt(req.params.id) });
      });

      const response = await request(app).get('/users/123');

      expect(response.body.id).toBe(123);
    });
  });

  describe('POST /users', () => {
    test('deve chamar controller create', async () => {
      userController.create.mockImplementation((req, res) => {
        res.status(201).json({ id: 1, ...req.body });
      });

      const response = await request(app)
        .post('/users')
        .send({ name: 'Test', email: 'test@test.com', password: '123456' });

      expect(userController.create).toHaveBeenCalled();
      expect(response.status).toBe(201);
    });

    test('deve criar usuário com dados corretos', async () => {
      const newUser = {
        name: 'Carlos',
        email: 'carlos@test.com',
        username: 'carlos',
        password: 'senha123',
      };
      userController.create.mockImplementation((req, res) => {
        res.status(201).json({ id: 5, ...req.body });
      });

      const response = await request(app)
        .post('/users')
        .send(newUser);

      expect(response.body).toMatchObject(newUser);
    });
  });

  describe('PUT /users/:id', () => {
    test('deve chamar controller update', async () => {
      userController.update.mockImplementation((req, res) => {
        res.json({ id: 1, ...req.body });
      });

      const response = await request(app)
        .put('/users/1')
        .send({ name: 'Updated' });

      expect(userController.update).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });

    test('deve atualizar com dados corretos', async () => {
      userController.update.mockImplementation((req, res) => {
        res.json({ id: parseInt(req.params.id), ...req.body });
      });

      const response = await request(app)
        .put('/users/3')
        .send({ name: 'Maria Silva', email: 'maria.silva@test.com' });

      expect(response.body).toEqual({
        id: 3,
        name: 'Maria Silva',
        email: 'maria.silva@test.com',
      });
    });
  });

  describe('DELETE /users', () => {
    test('deve chamar controller removeMany', async () => {
      userController.removeMany.mockImplementation((req, res) => {
        res.json({ message: 'Usuários excluídos com sucesso' });
      });

      const response = await request(app)
        .delete('/users')
        .send({ ids: [1, 2] });

      expect(userController.removeMany).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });

    test('deve remover com ids corretos', async () => {
      userController.removeMany.mockImplementation((req, res) => {
        res.json({
          message: 'Usuários excluídos com sucesso',
          count: req.body.ids.length,
        });
      });

      const response = await request(app)
        .delete('/users')
        .send({ ids: [1, 2, 3] });

      expect(response.body.count).toBe(3);
    });
  });
});