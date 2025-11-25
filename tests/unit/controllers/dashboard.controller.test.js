const dashboardController = require('../../../src/controllers/dashboard.controller');
const dashboardService = require('../../../src/services/dashboard.service');

jest.mock('../../../src/services/dashboard.service');

describe('Dashboard Controller', () => {
  let req, res;
  let consoleErrorSpy;

  beforeEach(() => {
    req = {
      query: {},
      user: { id: 1 },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    jest.clearAllMocks();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('getDashboardData', () => {
    test('deve retornar dados do dashboard com sucesso', async () => {
      const mockDashboardData = {
        totalTasks: 10,
        completedTasks: 5,
        pendingTasks: 5,
        overdueTasks: 2,
      };
      req.query.workspaceId = '1';
      dashboardService.getDashboardData.mockResolvedValue(mockDashboardData);

      await dashboardController.getDashboardData(req, res);

      expect(dashboardService.getDashboardData).toHaveBeenCalledWith(1, 1);
      expect(res.json).toHaveBeenCalledWith(mockDashboardData);
      expect(res.status).not.toHaveBeenCalled();
    });

    test('deve retornar 400 se workspaceId não for fornecido', async () => {
      req.query = {};

      await dashboardController.getDashboardData(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'workspaceId é obrigatório',
      });
      expect(dashboardService.getDashboardData).not.toHaveBeenCalled();
    });

    test('deve retornar 400 se workspaceId for undefined', async () => {
      req.query.workspaceId = undefined;

      await dashboardController.getDashboardData(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'workspaceId é obrigatório',
      });
    });

    test('deve retornar 400 se workspaceId for null', async () => {
      req.query.workspaceId = null;

      await dashboardController.getDashboardData(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'workspaceId é obrigatório',
      });
    });

    test('deve retornar 400 se workspaceId for string vazia', async () => {
      req.query.workspaceId = '';

      await dashboardController.getDashboardData(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'workspaceId é obrigatório',
      });
    });

    test('deve converter workspaceId para número', async () => {
      req.query.workspaceId = '42';
      dashboardService.getDashboardData.mockResolvedValue({});

      await dashboardController.getDashboardData(req, res);

      expect(dashboardService.getDashboardData).toHaveBeenCalledWith(42, 1);
    });

    test('deve usar userId do req.user', async () => {
      req.query.workspaceId = '1';
      req.user.id = 123;
      dashboardService.getDashboardData.mockResolvedValue({});

      await dashboardController.getDashboardData(req, res);

      expect(dashboardService.getDashboardData).toHaveBeenCalledWith(1, 123);
    });

    test('deve retornar 500 em caso de erro no service', async () => {
      const errorMessage = 'Erro no banco de dados';
      req.query.workspaceId = '1';
      dashboardService.getDashboardData.mockRejectedValue(
        new Error(errorMessage)
      );

      await dashboardController.getDashboardData(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Erro ao buscar dados do dashboard',
        error: errorMessage,
      });
    });

    test('deve logar erro no console quando ocorrer erro', async () => {
      const error = new Error('Erro teste');
      req.query.workspaceId = '1';
      dashboardService.getDashboardData.mockRejectedValue(error);

      await dashboardController.getDashboardData(req, res);

      expect(consoleErrorSpy).toHaveBeenCalledWith('Dashboard error:', error);
    });

    test('deve retornar mensagem de erro genérica se error.message não existir', async () => {
      req.query.workspaceId = '1';
      dashboardService.getDashboardData.mockRejectedValue({});

      await dashboardController.getDashboardData(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Erro ao buscar dados do dashboard',
        error: undefined,
      });
    });

    test('deve tratar erro quando service lança erro customizado', async () => {
      const customError = new Error('Workspace não encontrado');
      customError.statusCode = 404;
      req.query.workspaceId = '1';
      dashboardService.getDashboardData.mockRejectedValue(customError);

      await dashboardController.getDashboardData(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Erro ao buscar dados do dashboard',
        error: 'Workspace não encontrado',
      });
    });
  });
});