const request = require('supertest');
const express = require('express');
const stepRoutes = require('../../../src/routes/step.routes');
const stepController = require('../../../src/controllers/step.controller');
const { authRequired } = require('../../../src/middlewares/auth');

jest.mock('../../../src/controllers/step.controller');
jest.mock('../../../src/middlewares/auth');

describe('Step Routes', () => {
  let app;

  beforeEach(() => {
    authRequired.mockImplementation((req, res, next) => {
      req.user = { id: 1 };
      next();
    });
    
    app = express();
    app.use(express.json());
    app.use('/steps', stepRoutes);
    jest.clearAllMocks();
  });

  describe('GET /steps', () => {
    test('deve chamar controller getAll', async () => {
      stepController.getAll.mockImplementation((req, res) => {
        res.json([]);
      });

      const response = await request(app).get('/steps');

      expect(stepController.getAll).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });

    test('deve retornar lista de etapas', async () => {
      const mockSteps = [
        { id: 1, name: 'Análise', order: 1 },
        { id: 2, name: 'Desenvolvimento', order: 2 },
      ];
      stepController.getAll.mockImplementation((req, res) => {
        res.json(mockSteps);
      });

      const response = await request(app).get('/steps');

      expect(response.body).toEqual(mockSteps);
    });
  });

  describe('GET /steps/:id', () => {
    test('deve chamar controller getById', async () => {
      stepController.getById.mockImplementation((req, res) => {
        res.json({ id: 1 });
      });

      const response = await request(app).get('/steps/1');

      expect(stepController.getById).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });

    test('deve passar id correto', async () => {
      stepController.getById.mockImplementation((req, res) => {
        res.json({ id: parseInt(req.params.id) });
      });

      const response = await request(app).get('/steps/123');

      expect(response.body.id).toBe(123);
    });
  });

  describe('POST /steps', () => {
    test('deve chamar controller create', async () => {
      stepController.create.mockImplementation((req, res) => {
        res.status(201).json({ id: 1, ...req.body });
      });

      const response = await request(app)
        .post('/steps')
        .send({ name: 'Testes', order: 3 });

      expect(stepController.create).toHaveBeenCalled();
      expect(response.status).toBe(201);
    });

    test('deve criar etapa com dados corretos', async () => {
      const newStep = { name: 'Deploy', order: 4 };
      stepController.create.mockImplementation((req, res) => {
        res.status(201).json({ id: 4, ...req.body });
      });

      const response = await request(app)
        .post('/steps')
        .send(newStep);

      expect(response.body).toMatchObject(newStep);
    });
  });

  describe('PUT /steps/:id', () => {
    test('deve chamar controller update', async () => {
      stepController.update.mockImplementation((req, res) => {
        res.json({ id: 1, ...req.body });
      });

      const response = await request(app)
        .put('/steps/1')
        .send({ name: 'Atualizado' });

      expect(stepController.update).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });

    test('deve atualizar com dados corretos', async () => {
      stepController.update.mockImplementation((req, res) => {
        res.json({ id: parseInt(req.params.id), ...req.body });
      });

      const response = await request(app)
        .put('/steps/2')
        .send({ name: 'Revisão' });

      expect(response.body).toEqual({ id: 2, name: 'Revisão' });
    });
  });

  describe('DELETE /steps', () => {
    test('deve chamar controller removeMany', async () => {
      stepController.removeMany.mockImplementation((req, res) => {
        res.json({ message: 'Etapas excluídas com sucesso' });
      });

      const response = await request(app)
        .delete('/steps')
        .send({ ids: [1, 2] });

      expect(stepController.removeMany).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });

    test('deve remover com ids corretos', async () => {
      stepController.removeMany.mockImplementation((req, res) => {
        res.json({ message: 'Etapas excluídas com sucesso', count: req.body.ids.length });
      });

      const response = await request(app)
        .delete('/steps')
        .send({ ids: [1, 2, 3] });

      expect(response.body.count).toBe(3);
    });
  });
});