const request = require('supertest');
const express = require('express');
const dashboardRoutes = require('../../../src/routes/dashboard.routes');
const dashboardController = require('../../../src/controllers/dashboard.controller');

jest.mock('../../../src/controllers/dashboard.controller');
jest.mock('../../../src/middlewares/auth', () => ({
  authRequired: (req, res, next) => {
    req.user = { id: 1 };
    next();
  },
}));

describe('Dashboard Routes', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/dashboard', dashboardRoutes);
    jest.clearAllMocks();
  });

  describe('GET /dashboard', () => {
    test('deve chamar controller getDashboardData', async () => {
      dashboardController.getDashboardData.mockImplementation((req, res) => {
        res.json({
          totalTasks: 10,
          completedTasks: 5,
          overdueTasks: 2,
        });
      });

      const response = await request(app).get('/dashboard?workspaceId=1');

      expect(dashboardController.getDashboardData).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });

    test('deve passar query params para o controller', async () => {
      dashboardController.getDashboardData.mockImplementation((req, res) => {
        res.json({});
      });

      await request(app).get('/dashboard?workspaceId=42');

      const mockCall = dashboardController.getDashboardData.mock.calls[0];
      expect(mockCall[0].query.workspaceId).toBe('42');
    });

    test('deve adicionar req.user através do middleware', async () => {
      dashboardController.getDashboardData.mockImplementation((req, res) => {
        res.json({});
      });

      await request(app).get('/dashboard?workspaceId=1');

      const mockCall = dashboardController.getDashboardData.mock.calls[0];
      expect(mockCall[0].user).toEqual({ id: 1 });
    });

    test('deve aplicar middleware authRequired', async () => {
      dashboardController.getDashboardData.mockImplementation((req, res) => {
        res.json({});
      });

      await request(app).get('/dashboard?workspaceId=1');

      // Verifica se o req.user foi adicionado pelo middleware
      const mockCall = dashboardController.getDashboardData.mock.calls[0];
      expect(mockCall[0].user).toBeDefined();
      expect(mockCall[0].user.id).toBe(1);
    });

    test('deve retornar dados do dashboard no formato correto', async () => {
      const mockDashboardData = {
        totalTasks: 15,
        completedTasks: 7,
        overdueTasks: 3,
        upcomingTasks: 5,
        activeSprint: { id: 1, name: 'Sprint 1' },
        myTasks: [],
        tasksByStatus: [],
        tasksByPriority: [],
        tasksByType: [],
        epicProgress: [],
        recentActivity: [],
      };

      dashboardController.getDashboardData.mockImplementation((req, res) => {
        res.json(mockDashboardData);
      });

      const response = await request(app).get('/dashboard?workspaceId=1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockDashboardData);
    });

    test('deve retornar erro 400 quando workspaceId não for fornecido', async () => {
      dashboardController.getDashboardData.mockImplementation((req, res) => {
        res.status(400).json({ message: 'workspaceId é obrigatório' });
      });

      const response = await request(app).get('/dashboard');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: 'workspaceId é obrigatório' });
    });

    test('deve retornar erro 500 em caso de falha no controller', async () => {
      dashboardController.getDashboardData.mockImplementation((req, res) => {
        res.status(500).json({
          message: 'Erro ao buscar dados do dashboard',
          error: 'Erro interno',
        });
      });

      const response = await request(app).get('/dashboard?workspaceId=1');

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Erro ao buscar dados do dashboard');
    });

    test('deve aceitar workspaceId como número', async () => {
      dashboardController.getDashboardData.mockImplementation((req, res) => {
        res.json({});
      });

      const response = await request(app).get('/dashboard?workspaceId=123');

      expect(response.status).toBe(200);
      const mockCall = dashboardController.getDashboardData.mock.calls[0];
      expect(mockCall[0].query.workspaceId).toBe('123');
    });

    test('deve funcionar apenas com método GET', async () => {
      dashboardController.getDashboardData.mockImplementation((req, res) => {
        res.json({});
      });

      const getResponse = await request(app).get('/dashboard?workspaceId=1');
      expect(getResponse.status).toBe(200);

      // POST não deve funcionar
      const postResponse = await request(app)
        .post('/dashboard')
        .send({ workspaceId: 1 });
      expect(postResponse.status).toBe(404);
    });

    test('deve retornar 404 para rotas não definidas', async () => {
      const response = await request(app).get('/dashboard/invalid');

      expect(response.status).toBe(404);
    });
  });

  describe('Middleware de autenticação', () => {
    test('deve adicionar req.user através do middleware', async () => {
      dashboardController.getDashboardData.mockImplementation((req, res) => {
        res.json({});
      });

      await request(app).get('/dashboard?workspaceId=1');

      const mockCall = dashboardController.getDashboardData.mock.calls[0];
      expect(mockCall[0].user).toEqual({ id: 1 });
    });
  });
});