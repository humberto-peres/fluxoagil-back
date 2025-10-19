const request = require('supertest');
const express = require('express');
const workspaceRoutes = require('../../../src/routes/workspace.routes');
const workspaceController = require('../../../src/controllers/workspace.controller');
const { authRequired } = require('../../../src/middlewares/auth');

jest.mock('../../../src/controllers/workspace.controller');
jest.mock('../../../src/middlewares/auth');

describe('Workspace Routes', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());

    authRequired.mockImplementation((req, res, next) => {
      req.user = { id: 1 };
      next();
    });

    app.use('/workspaces', workspaceRoutes);
    jest.clearAllMocks();
  });

  describe('GET /workspaces/allowed', () => {
    test('deve chamar controller getAllowedForUser', async () => {
      workspaceController.getAllowedForUser.mockImplementation((req, res) => {
        res.json([]);
      });

      const response = await request(app).get('/workspaces/allowed');

      expect(workspaceController.getAllowedForUser).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });

    test('deve retornar workspaces permitidos para o usuário', async () => {
      const mockWorkspaces = [
        { id: 1, name: 'Workspace A', key: 'WSA' },
        { id: 2, name: 'Workspace B', key: 'WSB' },
      ];
      workspaceController.getAllowedForUser.mockImplementation((req, res) => {
        res.json(mockWorkspaces);
      });

      const response = await request(app).get('/workspaces/allowed');

      expect(response.body).toEqual(mockWorkspaces);
    });
  });

  describe('GET /workspaces/:id/can-access', () => {
    test('deve chamar controller canAccess', async () => {
      workspaceController.canAccess.mockImplementation((req, res) => {
        res.json({ allowed: true });
      });

      const response = await request(app).get('/workspaces/1/can-access');

      expect(workspaceController.canAccess).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });

    test('deve verificar acesso com id correto', async () => {
      workspaceController.canAccess.mockImplementation((req, res) => {
        res.json({ allowed: parseInt(req.params.id) === 5 });
      });

      const response = await request(app).get('/workspaces/5/can-access');

      expect(response.body.allowed).toBe(true);
    });
  });

  describe('GET /workspaces', () => {
    test('deve chamar controller getAll', async () => {
      workspaceController.getAll.mockImplementation((req, res) => {
        res.json([]);
      });

      const response = await request(app).get('/workspaces');

      expect(workspaceController.getAll).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });

    test('deve retornar lista de workspaces', async () => {
      const mockWorkspaces = [
        { id: 1, name: 'Workspace 1', key: 'WS1' },
        { id: 2, name: 'Workspace 2', key: 'WS2' },
      ];
      workspaceController.getAll.mockImplementation((req, res) => {
        res.json(mockWorkspaces);
      });

      const response = await request(app).get('/workspaces');

      expect(response.body).toEqual(mockWorkspaces);
    });
  });

  describe('GET /workspaces/:id', () => {
    test('deve chamar controller getById', async () => {
      workspaceController.getById.mockImplementation((req, res) => {
        res.json({ id: 1 });
      });

      const response = await request(app).get('/workspaces/1');

      expect(workspaceController.getById).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });

    test('deve passar id correto', async () => {
      workspaceController.getById.mockImplementation((req, res) => {
        res.json({ id: parseInt(req.params.id) });
      });

      const response = await request(app).get('/workspaces/123');

      expect(response.body.id).toBe(123);
    });
  });

  describe('POST /workspaces', () => {
    test('deve chamar controller create', async () => {
      workspaceController.create.mockImplementation((req, res) => {
        res.status(201).json({ id: 1, ...req.body });
      });

      const response = await request(app)
        .post('/workspaces')
        .send({ name: 'New Workspace', key: 'NEW' });

      expect(workspaceController.create).toHaveBeenCalled();
      expect(response.status).toBe(201);
    });

    test('deve criar workspace com dados corretos', async () => {
      const newWorkspace = {
        name: 'Project Alpha',
        key: 'ALPHA',
        methodology: 'Scrum',
        teamId: 1,
        steps: [{ stepId: 1, order: 1 }],
      };
      workspaceController.create.mockImplementation((req, res) => {
        res.status(201).json({ id: 5, ...req.body });
      });

      const response = await request(app)
        .post('/workspaces')
        .send(newWorkspace);

      expect(response.body).toMatchObject(newWorkspace);
    });
  });

  describe('PUT /workspaces/:id', () => {
    test('deve chamar controller update', async () => {
      workspaceController.update.mockImplementation((req, res) => {
        res.json({ id: 1, ...req.body });
      });

      const response = await request(app)
        .put('/workspaces/1')
        .send({ name: 'Updated' });

      expect(workspaceController.update).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });

    test('deve atualizar com dados corretos', async () => {
      workspaceController.update.mockImplementation((req, res) => {
        res.json({ id: parseInt(req.params.id), ...req.body });
      });

      const response = await request(app)
        .put('/workspaces/3')
        .send({ name: 'Updated Name', key: 'UPD' });

      expect(response.body).toEqual({ id: 3, name: 'Updated Name', key: 'UPD' });
    });
  });

  describe('DELETE /workspaces', () => {
    test('deve chamar controller deleteMany', async () => {
      workspaceController.deleteMany.mockImplementation((req, res) => {
        res.json({ message: 'Workspaces excluídos com sucesso' });
      });

      const response = await request(app)
        .delete('/workspaces')
        .send({ ids: [1, 2] });

      expect(workspaceController.deleteMany).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });

    test('deve remover com ids corretos', async () => {
      workspaceController.deleteMany.mockImplementation((req, res) => {
        res.json({
          message: 'Workspaces excluídos com sucesso',
          count: req.body.ids.length,
        });
      });

      const response = await request(app)
        .delete('/workspaces')
        .send({ ids: [1, 2, 3] });

      expect(response.body.count).toBe(3);
    });
  });

  describe('Middleware de autenticação', () => {
    test('deve aplicar authRequired em todas as rotas', async () => {
      workspaceController.getAll.mockImplementation((req, res) => {
        res.json([]);
      });

      await request(app).get('/workspaces');

      expect(authRequired).toHaveBeenCalled();
    });

    test('deve passar req.user para o controller', async () => {
      workspaceController.getAllowedForUser.mockImplementation((req, res) => {
        res.json({ userId: req.user.id });
      });

      const response = await request(app).get('/workspaces/allowed');

      expect(response.body.userId).toBe(1);
    });
  });
});