const sprintController = require('../../../src/controllers/sprint.controller');
const sprintService = require('../../../src/services/sprint.service');

jest.mock('../../../src/services/sprint.service');
jest.mock('../../../src/utils/datetime', () => ({
  formatSPDateTime: jest.fn((date) => date?.toISOString() || null),
  formatSPDate: jest.fn((date) => date?.toISOString().split('T')[0] || null),
}));

describe('Sprint Controller', () => {
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
    test('deve retornar todas as sprints serializadas', async () => {
      const mockSprints = [
        {
          id: 1,
          name: 'Sprint 1',
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-15'),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      sprintService.getAll.mockResolvedValue(mockSprints);

      await sprintController.getAll(req, res);

      expect(sprintService.getAll).toHaveBeenCalledWith({
        workspaceId: undefined,
        state: undefined,
      });
      expect(res.json).toHaveBeenCalled();
    });

    test('deve passar filtros para o service', async () => {
      req.query = { workspaceId: '1', state: 'active' };
      sprintService.getAll.mockResolvedValue([]);

      await sprintController.getAll(req, res);

      expect(sprintService.getAll).toHaveBeenCalledWith({
        workspaceId: '1',
        state: 'active',
      });
    });
  });

  describe('getById', () => {
    test('deve retornar sprint por id', async () => {
      const mockSprint = {
        id: 1,
        name: 'Sprint 1',
        startDate: new Date(),
        endDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      req.params.id = '1';
      sprintService.getById.mockResolvedValue(mockSprint);

      await sprintController.getById(req, res);

      expect(sprintService.getById).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalled();
    });

    test('deve retornar 404 se sprint não existir', async () => {
      req.params.id = '999';
      sprintService.getById.mockResolvedValue(null);

      await sprintController.getById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Não encontrada' });
    });
  });

  describe('create', () => {
    test('deve criar sprint com sucesso', async () => {
      const mockCreated = {
        id: 1,
        name: 'New Sprint',
        startDate: new Date(),
        endDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      req.body = { name: 'New Sprint', workspaceId: 1 };
      sprintService.create.mockResolvedValue(mockCreated);

      await sprintController.create(req, res);

      expect(sprintService.create).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    test('deve atualizar sprint com sucesso', async () => {
      const mockUpdated = {
        id: 1,
        name: 'Updated Sprint',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      req.params.id = '1';
      req.body = { name: 'Updated Sprint' };
      sprintService.update.mockResolvedValue(mockUpdated);

      await sprintController.update(req, res);

      expect(sprintService.update).toHaveBeenCalledWith(1, req.body);
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe('removeMany', () => {
    test('deve remover sprints com sucesso', async () => {
      req.body = { ids: [1, 2, 3] };
      sprintService.removeMany.mockResolvedValue({ count: 3 });

      await sprintController.removeMany(req, res);

      expect(sprintService.removeMany).toHaveBeenCalledWith([1, 2, 3]);
      expect(res.json).toHaveBeenCalledWith({ message: 'Removida(s) com sucesso!' });
    });

    test('deve usar array vazio se ids não for fornecido', async () => {
      req.body = {};
      sprintService.removeMany.mockResolvedValue({ count: 0 });

      await sprintController.removeMany(req, res);

      expect(sprintService.removeMany).toHaveBeenCalledWith([]);
    });
  });

  describe('activate', () => {
    test('deve ativar sprint com sucesso', async () => {
      const mockActivated = {
        id: 1,
        name: 'Sprint 1',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      req.params.id = '1';
      sprintService.activate.mockResolvedValue(mockActivated);

      await sprintController.activate(req, res);

      expect(sprintService.activate).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe('close', () => {
    test('deve encerrar sprint com sucesso', async () => {
      const mockResult = {
        sprint: {
          id: 1,
          name: 'Sprint 1',
          isActive: false,
          closedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        movedCount: 5,
      };
      req.params.id = '1';
      req.body = { move: { to: 'backlog' } };
      sprintService.close.mockResolvedValue(mockResult);

      await sprintController.close(req, res);

      expect(sprintService.close).toHaveBeenCalledWith(1, {
        move: { to: 'backlog' },
      });
      expect(res.json).toHaveBeenCalledWith({
        sprint: expect.any(Object),
        movedCount: 5,
      });
    });

    test('deve funcionar sem move options', async () => {
      const mockResult = {
        sprint: { id: 1, createdAt: new Date(), updatedAt: new Date() },
        movedCount: 0,
      };
      req.params.id = '1';
      req.body = {};
      sprintService.close.mockResolvedValue(mockResult);

      await sprintController.close(req, res);

      expect(sprintService.close).toHaveBeenCalledWith(1, { move: undefined });
    });
  });
});