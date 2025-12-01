const request = require('supertest');
const express = require('express');
const teamRoutes = require('../../../src/routes/team.routes');
const teamController = require('../../../src/controllers/team.controller');
const { authRequired } = require('../../../src/middlewares/auth');

jest.mock('../../../src/controllers/team.controller');
jest.mock('../../../src/middlewares/auth');

describe('Team Routes', () => {
  let app;

  beforeEach(() => {
    authRequired.mockImplementation((req, res, next) => {
      req.user = { id: 1 };
      next();
    });

    app = express();
    app.use(express.json());
    app.use('/teams', teamRoutes);
    jest.clearAllMocks();
  });

  describe('GET /teams', () => {
    test('deve chamar controller getAll', async () => {
      teamController.getAll.mockImplementation((req, res) => {
        res.json([]);
      });

      const response = await request(app).get('/teams');

      expect(teamController.getAll).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });

    test('deve retornar lista de equipes', async () => {
      const mockTeams = [
        { id: 1, name: 'Dev Team' },
        { id: 2, name: 'QA Team' },
      ];
      teamController.getAll.mockImplementation((req, res) => {
        res.json(mockTeams);
      });

      const response = await request(app).get('/teams');

      expect(response.body).toEqual(mockTeams);
    });
  });

  describe('GET /teams/:id', () => {
    test('deve chamar controller getById', async () => {
      teamController.getById.mockImplementation((req, res) => {
        res.json({ id: 1 });
      });

      const response = await request(app).get('/teams/1');

      expect(teamController.getById).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });

    test('deve passar id correto', async () => {
      teamController.getById.mockImplementation((req, res) => {
        res.json({ id: parseInt(req.params.id) });
      });

      const response = await request(app).get('/teams/123');

      expect(response.body.id).toBe(123);
    });
  });

  describe('POST /teams', () => {
    test('deve chamar controller create', async () => {
      teamController.create.mockImplementation((req, res) => {
        res.status(201).json({ id: 1, ...req.body });
      });

      const response = await request(app)
        .post('/teams')
        .send({ name: 'New Team' });

      expect(teamController.create).toHaveBeenCalled();
      expect(response.status).toBe(201);
    });

    test('deve criar equipe com dados corretos', async () => {
      const newTeam = { name: 'Frontend Team' };
      teamController.create.mockImplementation((req, res) => {
        res.status(201).json({ id: 5, ...req.body });
      });

      const response = await request(app)
        .post('/teams')
        .send(newTeam);

      expect(response.body).toMatchObject(newTeam);
    });
  });

  describe('PUT /teams/:id', () => {
    test('deve chamar controller update', async () => {
      teamController.update.mockImplementation((req, res) => {
        res.json({ id: 1, ...req.body });
      });

      const response = await request(app)
        .put('/teams/1')
        .send({ name: 'Updated Team' });

      expect(teamController.update).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });

    test('deve atualizar com dados corretos', async () => {
      teamController.update.mockImplementation((req, res) => {
        res.json({ id: parseInt(req.params.id), ...req.body });
      });

      const response = await request(app)
        .put('/teams/3')
        .send({ name: 'Backend Team' });

      expect(response.body).toEqual({ id: 3, name: 'Backend Team' });
    });
  });

  describe('DELETE /teams', () => {
    test('deve chamar controller removeMany', async () => {
      teamController.removeMany.mockImplementation((req, res) => {
        res.json({ message: 'Equipes excluídas com sucesso' });
      });

      const response = await request(app)
        .delete('/teams')
        .send({ ids: [1, 2] });

      expect(teamController.removeMany).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });

    test('deve remover com ids corretos', async () => {
      teamController.removeMany.mockImplementation((req, res) => {
        res.json({ message: 'Equipes excluídas com sucesso', count: req.body.ids.length });
      });

      const response = await request(app)
        .delete('/teams')
        .send({ ids: [1, 2, 3] });

      expect(response.body.count).toBe(3);
    });
  });
});