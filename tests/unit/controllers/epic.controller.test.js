const epicController = require('../../../src/controllers/epic.controller');
const epicService = require('../../../src/services/epic.service');
const { formatSPDateTime, formatSPDate } = require('../../../src/utils/datetime');

jest.mock('../../../src/services/epic.service');
jest.mock('../../../src/utils/datetime', () => ({
  formatSPDateTime: jest.fn((date) => date?.toISOString() || null),
  formatSPDate: jest.fn((date) => date?.toISOString().split('T')[0] || null),
}));

describe('Epic Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      query: {},
      params: {},
      body: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    test('deve retornar todos os épicos serializados', async () => {
      const mockEpics = [
        {
          id: 1,
          key: 'ALPHA-E1',
          title: 'Epic 1',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-02'),
          startDate: new Date('2024-01-01'),
          targetDate: new Date('2024-02-01'),
        },
      ];
      epicService.getAll.mockResolvedValue(mockEpics);

      await epicController.getAll(req, res);

      expect(epicService.getAll).toHaveBeenCalledWith({
        workspaceId: undefined,
        status: undefined,
      });
      expect(res.json).toHaveBeenCalled();
    });

    test('deve passar filtros para o service', async () => {
      req.query = { workspaceId: '1', status: 'open' };
      epicService.getAll.mockResolvedValue([]);

      await epicController.getAll(req, res);

      expect(epicService.getAll).toHaveBeenCalledWith({
        workspaceId: '1',
        status: 'open',
      });
    });

    test('deve serializar tasks se existirem', async () => {
      const mockEpics = [
        {
          id: 1,
          tasks: [
            {
              id: 1,
              title: 'Task 1',
              createdAt: new Date('2024-01-01'),
              updatedAt: new Date('2024-01-02'),
              startDate: new Date('2024-01-01'),
              deadline: new Date('2024-01-10'),
            },
          ],
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-02'),
        },
      ];
      epicService.getAll.mockResolvedValue(mockEpics);

      await epicController.getAll(req, res);

      expect(formatSPDateTime).toHaveBeenCalled();
      expect(formatSPDate).toHaveBeenCalled();
    });
  });

  describe('getById', () => {
    test('deve retornar épico por id', async () => {
      const mockEpic = {
        id: 1,
        key: 'ALPHA-E1',
        title: 'Epic 1',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
        startDate: new Date('2024-01-01'),
        targetDate: new Date('2024-02-01'),
      };
      req.params.id = '1';
      epicService.getById.mockResolvedValue(mockEpic);

      await epicController.getById(req, res);

      expect(epicService.getById).toHaveBeenCalledWith('1');
      expect(res.json).toHaveBeenCalled();
    });

    test('deve retornar 404 se épico não existir', async () => {
      req.params.id = '999';
      epicService.getById.mockResolvedValue(null);

      await epicController.getById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Não encontrado' });
    });
  });

  describe('create', () => {
    test('deve criar épico com sucesso', async () => {
      const mockCreated = {
        id: 1,
        key: 'ALPHA-E1',
        title: 'New Epic',
        workspaceId: 1,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        startDate: null,
        targetDate: null,
      };
      req.body = { workspaceId: 1, title: 'New Epic' };
      epicService.create.mockResolvedValue(mockCreated);

      await epicController.create(req, res);

      expect(epicService.create).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalled();
    });

    test('deve retornar 400 se workspaceId não for fornecido', async () => {
      req.body = { title: 'New Epic' };

      await epicController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'workspaceId é obrigatório',
      });
      expect(epicService.create).not.toHaveBeenCalled();
    });

    test('deve retornar 400 se body estiver vazio', async () => {
      req.body = undefined;

      await epicController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'workspaceId é obrigatório',
      });
    });
  });

  describe('update', () => {
    test('deve atualizar épico com sucesso', async () => {
      const mockUpdated = {
        id: 1,
        title: 'Updated Epic',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
        startDate: null,
        targetDate: null,
      };
      req.params.id = '1';
      req.body = { title: 'Updated Epic' };
      epicService.update.mockResolvedValue(mockUpdated);

      await epicController.update(req, res);

      expect(epicService.update).toHaveBeenCalledWith('1', req.body);
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe('removeMany', () => {
    test('deve remover épicos com sucesso', async () => {
      req.body = { ids: [1, 2, 3] };
      epicService.removeMany.mockResolvedValue({ count: 3 });

      await epicController.removeMany(req, res);

      expect(epicService.removeMany).toHaveBeenCalledWith([1, 2, 3]);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Épico(s) removido(s) com sucesso!',
      });
    });

    test('deve usar array vazio se ids não for fornecido', async () => {
      req.body = {};
      epicService.removeMany.mockResolvedValue({ count: 0 });

      await epicController.removeMany(req, res);

      expect(epicService.removeMany).toHaveBeenCalledWith([]);
    });

    test('deve tratar erro com statusCode', async () => {
      req.body = { ids: [1] };
      const error = new Error('Épico possui tarefas');
      error.statusCode = 409;
      epicService.removeMany.mockRejectedValue(error);

      await epicController.removeMany(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Épico possui tarefas',
      });
    });

    test('deve usar status 500 se statusCode não existir', async () => {
      req.body = { ids: [1] };
      const error = new Error('Erro genérico');
      epicService.removeMany.mockRejectedValue(error);

      await epicController.removeMany(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Erro genérico',
      });
    });

    test('deve usar mensagem padrão se error.message não existir', async () => {
      req.body = { ids: [1] };
      epicService.removeMany.mockRejectedValue({});

      await epicController.removeMany(req, res);

      expect(res.json).toHaveBeenCalledWith({
        message: 'Erro ao remover épico(s)',
      });
    });
  });
});