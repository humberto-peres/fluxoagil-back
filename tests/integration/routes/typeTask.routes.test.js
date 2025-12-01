const request = require('supertest');
const express = require('express');
const typeTaskRoutes = require('../../../src/routes/typeTask.routes');
const typeTaskController = require('../../../src/controllers/typeTask.controller');
const { authRequired } = require('../../../src/middlewares/auth');

jest.mock('../../../src/controllers/typeTask.controller');
jest.mock('../../../src/middlewares/auth');

describe('TypeTask Routes', () => {
  let app;

  beforeEach(() => {
    authRequired.mockImplementation((req, res, next) => {
      req.user = { id: 1 };
      next();
    });

    app = express();
    app.use(express.json());
    app.use('/type-tasks', typeTaskRoutes);
    jest.clearAllMocks();
  });

  describe('GET /type-tasks', () => {
    test('deve chamar controller getAll', async () => {
      typeTaskController.getAll.mockImplementation((req, res) => {
        res.json([]);
      });

      const response = await request(app).get('/type-tasks');

      expect(typeTaskController.getAll).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });

    test('deve retornar lista de tipos de atividade', async () => {
      const mockTypes = [
        { id: 1, name: 'Bug', icon: '🐛' },
        { id: 2, name: 'Feature', icon: '✨' },
      ];
      typeTaskController.getAll.mockImplementation((req, res) => {
        res.json(mockTypes);
      });

      const response = await request(app).get('/type-tasks');

      expect(response.body).toEqual(mockTypes);
    });
  });

  describe('GET /type-tasks/:id', () => {
    test('deve chamar controller getById', async () => {
      typeTaskController.getById.mockImplementation((req, res) => {
        res.json({ id: 1 });
      });

      const response = await request(app).get('/type-tasks/1');

      expect(typeTaskController.getById).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });

    test('deve passar id correto', async () => {
      typeTaskController.getById.mockImplementation((req, res) => {
        res.json({ id: parseInt(req.params.id) });
      });

      const response = await request(app).get('/type-tasks/123');

      expect(response.body.id).toBe(123);
    });
  });

  describe('POST /type-tasks', () => {
    test('deve chamar controller create', async () => {
      typeTaskController.create.mockImplementation((req, res) => {
        res.status(201).json({ id: 1, ...req.body });
      });

      const response = await request(app)
        .post('/type-tasks')
        .send({ name: 'Task', icon: '📋' });

      expect(typeTaskController.create).toHaveBeenCalled();
      expect(response.status).toBe(201);
    });

    test('deve criar tipo de atividade com dados corretos', async () => {
      const newType = { name: 'Documentation', icon: '📚' };
      typeTaskController.create.mockImplementation((req, res) => {
        res.status(201).json({ id: 5, ...req.body });
      });

      const response = await request(app)
        .post('/type-tasks')
        .send(newType);

      expect(response.body).toMatchObject(newType);
    });
  });

  describe('PUT /type-tasks/:id', () => {
    test('deve chamar controller update', async () => {
      typeTaskController.update.mockImplementation((req, res) => {
        res.json({ id: 1, ...req.body });
      });

      const response = await request(app)
        .put('/type-tasks/1')
        .send({ name: 'Updated' });

      expect(typeTaskController.update).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });

    test('deve atualizar com dados corretos', async () => {
      typeTaskController.update.mockImplementation((req, res) => {
        res.json({ id: parseInt(req.params.id), ...req.body });
      });

      const response = await request(app)
        .put('/type-tasks/3')
        .send({ name: 'Improvement', icon: '⚡' });

      expect(response.body).toEqual({ id: 3, name: 'Improvement', icon: '⚡' });
    });
  });

  describe('DELETE /type-tasks', () => {
    test('deve chamar controller deleteMany', async () => {
      typeTaskController.deleteMany.mockImplementation((req, res) => {
        res.json({ message: 'Tipos de Atividade excluídos com sucesso' });
      });

      const response = await request(app)
        .delete('/type-tasks')
        .send({ ids: [1, 2] });

      expect(typeTaskController.deleteMany).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });

    test('deve remover com ids corretos', async () => {
      typeTaskController.deleteMany.mockImplementation((req, res) => {
        res.json({ message: 'Tipos de Atividade excluídos com sucesso', count: req.body.ids.length });
      });

      const response = await request(app)
        .delete('/type-tasks')
        .send({ ids: [1, 2, 3] });

      expect(response.body.count).toBe(3);
    });
  });
});