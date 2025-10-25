const priorityController = require('../../../src/controllers/priority.controller');
const priorityService = require('../../../src/services/priority.service');

jest.mock('../../../src/services/priority.service');

describe('Priority Controller', () => {
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
    test('deve retornar todas as prioridades', async () => {
      const mockPriorities = [
        { id: 1, label: 'Low', name: 'low', deleted: false },
        { id: 2, label: 'High', name: 'high', deleted: false },
      ];
      priorityService.getAll.mockResolvedValue(mockPriorities);

      await priorityController.getAll(req, res);

      expect(priorityService.getAll).toHaveBeenCalledWith();
      expect(res.json).toHaveBeenCalledWith(mockPriorities);
    });

    test('deve retornar array vazio quando não houver prioridades', async () => {
      priorityService.getAll.mockResolvedValue([]);

      await priorityController.getAll(req, res);

      expect(res.json).toHaveBeenCalledWith([]);
    });

    test('deve tratar erro do service', async () => {
      priorityService.getAll.mockRejectedValue(new Error('Database error'));

      await expect(priorityController.getAll(req, res)).rejects.toThrow('Database error');
    });
  });

  describe('getById', () => {
    test('deve retornar prioridade por id', async () => {
      const mockPriority = { id: 1, label: 'High', name: 'high', deleted: false };
      req.params.id = '1';
      priorityService.getById.mockResolvedValue(mockPriority);

      await priorityController.getById(req, res);

      expect(priorityService.getById).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith(mockPriority);
    });

    test('deve converter id string para número', async () => {
      req.params.id = '123';
      priorityService.getById.mockResolvedValue({});

      await priorityController.getById(req, res);

      expect(priorityService.getById).toHaveBeenCalledWith(123);
    });

    test('deve retornar 404 quando prioridade não existir', async () => {
      req.params.id = '999';
      priorityService.getById.mockResolvedValue(null);

      await priorityController.getById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Não encontrada' });
    });

    test('deve retornar 404 quando retornar undefined', async () => {
      req.params.id = '999';
      priorityService.getById.mockResolvedValue(undefined);

      await priorityController.getById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Não encontrada' });
    });
  });

  describe('create', () => {
    test('deve criar prioridade com sucesso', async () => {
      const newPriority = { label: 'Critical', name: 'critical' };
      const createdPriority = { id: 4, ...newPriority, deleted: false };
      req.body = newPriority;
      priorityService.create.mockResolvedValue(createdPriority);

      await priorityController.create(req, res);

      expect(priorityService.create).toHaveBeenCalledWith(newPriority);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(createdPriority);
    });

    test('deve criar prioridade com todos os campos', async () => {
      const newPriority = { label: 'Urgent', name: 'urgent', deleted: false };
      req.body = newPriority;
      priorityService.create.mockResolvedValue({ id: 5, ...newPriority });

      await priorityController.create(req, res);

      expect(priorityService.create).toHaveBeenCalledWith(newPriority);
      expect(res.status).toHaveBeenCalledWith(201);
    });

    test('deve tratar erro do service', async () => {
      req.body = { label: 'Test' };
      priorityService.create.mockRejectedValue(new Error('Validation error'));

      await expect(priorityController.create(req, res)).rejects.toThrow('Validation error');
    });
  });

  describe('update', () => {
    test('deve atualizar prioridade com sucesso', async () => {
      const updateData = { label: 'Very High' };
      const updatedPriority = { id: 1, label: 'Very High', name: 'high', deleted: false };
      req.params.id = '1';
      req.body = updateData;
      priorityService.update.mockResolvedValue(updatedPriority);

      await priorityController.update(req, res);

      expect(priorityService.update).toHaveBeenCalledWith(1, updateData);
      expect(res.json).toHaveBeenCalledWith(updatedPriority);
    });

    test('deve converter id string para número', async () => {
      req.params.id = '456';
      req.body = { label: 'Updated' };
      priorityService.update.mockResolvedValue({});

      await priorityController.update(req, res);

      expect(priorityService.update).toHaveBeenCalledWith(456, req.body);
    });

    test('deve permitir atualizar campo deleted', async () => {
      req.params.id = '1';
      req.body = { deleted: true };
      priorityService.update.mockResolvedValue({});

      await priorityController.update(req, res);

      expect(priorityService.update).toHaveBeenCalledWith(1, { deleted: true });
    });

    test('deve tratar erro do service', async () => {
      req.params.id = '1';
      req.body = { label: 'Test' };
      priorityService.update.mockRejectedValue(new Error('Not found'));

      await expect(priorityController.update(req, res)).rejects.toThrow('Not found');
    });
  });

  describe('removeMany', () => {
    test('deve remover múltiplas prioridades com sucesso', async () => {
      req.body = { ids: [1, 2, 3] };
      priorityService.removeMany.mockResolvedValue({ count: 3 });

      await priorityController.removeMany(req, res);

      expect(priorityService.removeMany).toHaveBeenCalledWith([1, 2, 3]);
      expect(res.json).toHaveBeenCalledWith({ message: 'Removido com sucesso!' });
    });

    test('deve remover uma única prioridade', async () => {
      req.body = { ids: [1] };
      priorityService.removeMany.mockResolvedValue({ count: 1 });

      await priorityController.removeMany(req, res);

      expect(priorityService.removeMany).toHaveBeenCalledWith([1]);
      expect(res.json).toHaveBeenCalledWith({ message: 'Removido com sucesso!' });
    });

    test('deve funcionar com array vazio', async () => {
      req.body = { ids: [] };
      priorityService.removeMany.mockResolvedValue({ count: 0 });

      await priorityController.removeMany(req, res);

      expect(priorityService.removeMany).toHaveBeenCalledWith([]);
      expect(res.json).toHaveBeenCalledWith({ message: 'Removido com sucesso!' });
    });

    test('deve funcionar quando ids não for fornecido', async () => {
      req.body = {};
      priorityService.removeMany.mockResolvedValue({ count: 0 });

      await priorityController.removeMany(req, res);

      expect(priorityService.removeMany).toHaveBeenCalledWith(undefined);
    });

    test('deve tratar erro do service', async () => {
      req.body = { ids: [1] };
      priorityService.removeMany.mockRejectedValue(new Error('Cannot delete'));

      await expect(priorityController.removeMany(req, res)).rejects.toThrow('Cannot delete');
    });
  });
});