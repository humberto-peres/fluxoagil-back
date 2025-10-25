const request = require('supertest');
const express = require('express');
const epicRoutes = require('../../../src/routes/epic.routes');
const epicController = require('../../../src/controllers/epic.controller');

jest.mock('../../../src/controllers/epic.controller');

describe('Epic Routes', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/epics', epicRoutes);
    jest.clearAllMocks();
  });

  describe('GET /epics', () => {
    test('deve chamar controller getAll', async () => {
      epicController.getAll.mockImplementation((req, res) => {
        res.json([]);
      });

      const response = await request(app).get('/epics');

      expect(epicController.getAll).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });

    test('deve passar query params', async () => {
      epicController.getAll.mockImplementation((req, res) => {
        res.json([]);
      });

      await request(app).get('/epics?workspaceId=1&status=open');

      expect(epicController.getAll).toHaveBeenCalled();
    });
  });

  describe('GET /epics/:id', () => {
    test('deve chamar controller getById', async () => {
      epicController.getById.mockImplementation((req, res) => {
        res.json({ id: 1 });
      });

      const response = await request(app).get('/epics/1');

      expect(epicController.getById).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });
  });

  describe('POST /epics', () => {
    test('deve chamar controller create', async () => {
      epicController.create.mockImplementation((req, res) => {
        res.status(201).json({ id: 1 });
      });

      const response = await request(app)
        .post('/epics')
        .send({ workspaceId: 1, title: 'New Epic' });

      expect(epicController.create).toHaveBeenCalled();
      expect(response.status).toBe(201);
    });
  });

  describe('PUT /epics/:id', () => {
    test('deve chamar controller update', async () => {
      epicController.update.mockImplementation((req, res) => {
        res.json({ id: 1 });
      });

      const response = await request(app)
        .put('/epics/1')
        .send({ title: 'Updated' });

      expect(epicController.update).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });
  });

  describe('DELETE /epics', () => {
    test('deve chamar controller removeMany', async () => {
      epicController.removeMany.mockImplementation((req, res) => {
        res.json({ message: 'OK' });
      });

      const response = await request(app)
        .delete('/epics')
        .send({ ids: [1, 2] });

      expect(epicController.removeMany).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });
  });
});