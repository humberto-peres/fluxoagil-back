const typeTaskController = require('../../../src/controllers/typeTask.controller');
const typeTaskService = require('../../../src/services/typeTask.service');

jest.mock('../../../src/services/typeTask.service');

describe('TypeTask Controller', () => {
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
    test('deve retornar todos os tipos de atividade', async () => {
      const mockTypes = [
        { id: 1, name: 'Bug', icon: '🐛' },
        { id: 2, name: 'Feature', icon: '✨' },
      ];
      typeTaskService.getAll.mockResolvedValue(mockTypes);

      await typeTaskController.getAll(req, res);

      expect(typeTaskService.getAll).toHaveBeenCalledWith();
      expect(res.json).toHaveBeenCalledWith(mockTypes);
    });

    test('deve retornar array vazio quando não houver tipos', async () => {
      typeTaskService.getAll.mockResolvedValue([]);

      await typeTaskController.getAll(req, res);

      expect(res.json).toHaveBeenCalledWith([]);
    });

    test('deve tratar erro do service', async () => {
      typeTaskService.getAll.mockRejectedValue(new Error('Database error'));

      await expect(typeTaskController.getAll(req, res)).rejects.toThrow('Database error');
    });
  });

  describe('getById', () => {
    test('deve retornar tipo de atividade por id', async () => {
      const mockType = { id: 1, name: 'Bug', icon: '🐛' };
      req.params.id = '1';
      typeTaskService.getById.mockResolvedValue(mockType);

      await typeTaskController.getById(req, res);

      expect(typeTaskService.getById).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith(mockType);
    });

    test('deve converter id string para número', async () => {
      req.params.id = '123';
      typeTaskService.getById.mockResolvedValue({});

      await typeTaskController.getById(req, res);

      expect(typeTaskService.getById).toHaveBeenCalledWith(123);
    });

    test('deve retornar 404 quando tipo não existir', async () => {
      req.params.id = '999';
      typeTaskService.getById.mockResolvedValue(null);

      await typeTaskController.getById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Tipo de Atividade não encontrado',
      });
    });

    test('deve retornar 404 quando retornar undefined', async () => {
      req.params.id = '999';
      typeTaskService.getById.mockResolvedValue(undefined);

      await typeTaskController.getById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Tipo de Atividade não encontrado',
      });
    });
  });

  describe('create', () => {
    test('deve criar tipo de atividade com sucesso', async () => {
      const newType = { name: 'Task', icon: '📋' };
      const createdType = { id: 3, ...newType };
      req.body = newType;
      typeTaskService.create.mockResolvedValue(createdType);

      await typeTaskController.create(req, res);

      expect(typeTaskService.create).toHaveBeenCalledWith(newType);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(createdType);
    });

    test('deve criar tipo com todos os campos', async () => {
      const newType = {
        name: 'Documentation',
        icon: '📚',
        description: 'Documentation task',
      };
      req.body = newType;
      typeTaskService.create.mockResolvedValue({ id: 4, ...newType });

      await typeTaskController.create(req, res);

      expect(typeTaskService.create).toHaveBeenCalledWith(newType);
      expect(res.status).toHaveBeenCalledWith(201);
    });

    test('deve tratar erro do service', async () => {
      req.body = { name: 'Test' };
      typeTaskService.create.mockRejectedValue(new Error('Validation error'));

      await expect(typeTaskController.create(req, res)).rejects.toThrow('Validation error');
    });
  });

  describe('update', () => {
    test('deve atualizar tipo de atividade com sucesso', async () => {
      const updateData = { name: 'Critical Bug' };
      const updatedType = { id: 1, name: 'Critical Bug', icon: '🔥' };
      req.params.id = '1';
      req.body = updateData;
      typeTaskService.update.mockResolvedValue(updatedType);

      await typeTaskController.update(req, res);

      expect(typeTaskService.update).toHaveBeenCalledWith(1, updateData);
      expect(res.json).toHaveBeenCalledWith(updatedType);
    });

    test('deve converter id string para número', async () => {
      req.params.id = '456';
      req.body = { name: 'Updated' };
      typeTaskService.update.mockResolvedValue({});

      await typeTaskController.update(req, res);

      expect(typeTaskService.update).toHaveBeenCalledWith(456, req.body);
    });

    test('deve permitir atualizar apenas alguns campos', async () => {
      req.params.id = '1';
      req.body = { icon: '🎯' };
      typeTaskService.update.mockResolvedValue({});

      await typeTaskController.update(req, res);

      expect(typeTaskService.update).toHaveBeenCalledWith(1, { icon: '🎯' });
    });

    test('deve retornar 404 quando tipo não existir', async () => {
      req.params.id = '999';
      req.body = { name: 'Test' };
      typeTaskService.update.mockRejectedValue(new Error('Not found'));

      await typeTaskController.update(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Tipo de Atividade não encontrado',
      });
    });
  });

  describe('deleteMany', () => {
    test('deve remover múltiplos tipos com sucesso', async () => {
      req.body = { ids: [1, 2, 3] };
      typeTaskService.deleteMany.mockResolvedValue({ count: 3 });

      await typeTaskController.deleteMany(req, res);

      expect(typeTaskService.deleteMany).toHaveBeenCalledWith([1, 2, 3]);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Tipos de Atividade excluídos com sucesso',
      });
    });

    test('deve remover um único tipo', async () => {
      req.body = { ids: [1] };
      typeTaskService.deleteMany.mockResolvedValue({ count: 1 });

      await typeTaskController.deleteMany(req, res);

      expect(typeTaskService.deleteMany).toHaveBeenCalledWith([1]);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Tipos de Atividade excluídos com sucesso',
      });
    });

    test('deve retornar 400 quando ids não for array', async () => {
      req.body = { ids: 'not-an-array' };

      await typeTaskController.deleteMany(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Nenhum ID fornecido',
      });
      expect(typeTaskService.deleteMany).not.toHaveBeenCalled();
    });

    test('deve retornar 400 quando ids for array vazio', async () => {
      req.body = { ids: [] };

      await typeTaskController.deleteMany(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Nenhum ID fornecido',
      });
      expect(typeTaskService.deleteMany).not.toHaveBeenCalled();
    });

    test('deve retornar 400 quando ids não for fornecido', async () => {
      req.body = {};

      await typeTaskController.deleteMany(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Nenhum ID fornecido',
      });
    });

    test('deve retornar 500 em caso de erro no service', async () => {
      req.body = { ids: [1, 2] };
      const error = new Error('Delete failed');
      typeTaskService.deleteMany.mockRejectedValue(error);

      await typeTaskController.deleteMany(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Erro ao excluir Tipos de Atividade',
        error,
      });
    });
  });
});