const request = require('supertest');
const express = require('express');
const priorityRoutes = require('../../../src/routes/priority.routes');
const priorityController = require('../../../src/controllers/priority.controller');

jest.mock('../../../src/controllers/priority.controller');

describe('Priority Routes', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/priorities', priorityRoutes);
    jest.clearAllMocks();
  });

  describe('GET /priorities', () => {
    test('deve chamar controller getAll', async () => {
      priorityController.getAll.mockImplementation((req, res) => {
        res.json([]);
      });

      const response = await request(app).get('/priorities');

      expect(priorityController.getAll).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });

    test('deve retornar lista de prioridades', async () => {
      const mockPriorities = [
        { id: 1, label: 'Low', name: 'low' },
        { id: 2, label: 'High', name: 'high' },
      ];
      priorityController.getAll.mockImplementation((req, res) => {
        res.json(mockPriorities);
      });

      const response = await request(app).get('/priorities');

      expect(response.body).toEqual(mockPriorities);
    });
  });

  describe('GET /priorities/:id', () => {
    test('deve chamar controller getById', async () => {
      priorityController.getById.mockImplementation((req, res) => {
        res.json({ id: 1 });
      });

      const response = await request(app).get('/priorities/1');

      expect(priorityController.getById).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });

    test('deve passar id correto', async () => {
      priorityController.getById.mockImplementation((req, res) => {
        res.json({ id: parseInt(req.params.id) });
      });

      const response = await request(app).get('/priorities/123');

      expect(response.body.id).toBe(123);
    });
  });

  describe('POST /priorities', () => {
    test('deve chamar controller create', async () => {
      priorityController.create.mockImplementation((req, res) => {
        res.status(201).json({ id: 1, ...req.body });
      });

      const response = await request(app)
        .post('/priorities')
        .send({ label: 'Critical', name: 'critical' });

      expect(priorityController.create).toHaveBeenCalled();
      expect(response.status).toBe(201);
    });

    test('deve criar prioridade com dados corretos', async () => {
      const newPriority = { label: 'Urgent', name: 'urgent' };
      priorityController.create.mockImplementation((req, res) => {
        res.status(201).json({ id: 4, ...req.body });
      });

      const response = await request(app)
        .post('/priorities')
        .send(newPriority);

      expect(response.body).toMatchObject(newPriority);
    });
  });

  describe('PUT /priorities/:id', () => {
    test('deve chamar controller update', async () => {
      priorityController.update.mockImplementation((req, res) => {
        res.json({ id: 1, ...req.body });
      });

      const response = await request(app)
        .put('/priorities/1')
        .send({ label: 'Updated' });

      expect(priorityController.update).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });

    test('deve atualizar com dados corretos', async () => {
      priorityController.update.mockImplementation((req, res) => {
        res.json({ id: parseInt(req.params.id), ...req.body });
      });

      const response = await request(app)
        .put('/priorities/2')
        .send({ label: 'Super High' });

      expect(response.body).toEqual({ id: 2, label: 'Super High' });
    });
  });

  describe('DELETE /priorities', () => {
    test('deve chamar controller removeMany', async () => {
      priorityController.removeMany.mockImplementation((req, res) => {
        res.json({ message: 'Removido com sucesso!' });
      });

      const response = await request(app)
        .delete('/priorities')
        .send({ ids: [1, 2] });

      expect(priorityController.removeMany).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });

    test('deve remover com ids corretos', async () => {
      priorityController.removeMany.mockImplementation((req, res) => {
        res.json({ message: 'Removido com sucesso!', count: req.body.ids.length });
      });

      const response = await request(app)
        .delete('/priorities')
        .send({ ids: [1, 2, 3] });

      expect(response.body.count).toBe(3);
    });
  });
});