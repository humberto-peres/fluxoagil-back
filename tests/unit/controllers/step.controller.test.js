const stepController = require('../../../src/controllers/step.controller');
const stepService = require('../../../src/services/step.service');

jest.mock('../../../src/services/step.service');

describe('Step Controller', () => {
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
    test('deve retornar todas as etapas', async () => {
      const mockSteps = [
        { id: 1, name: 'Análise', order: 1 },
        { id: 2, name: 'Desenvolvimento', order: 2 },
      ];
      stepService.getAll.mockResolvedValue(mockSteps);

      await stepController.getAll(req, res);

      expect(stepService.getAll).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(mockSteps);
    });

    test('deve retornar array vazio quando não houver etapas', async () => {
      stepService.getAll.mockResolvedValue([]);

      await stepController.getAll(req, res);

      expect(res.json).toHaveBeenCalledWith([]);
    });

    test('deve tratar erro do service', async () => {
      stepService.getAll.mockRejectedValue(new Error('Database error'));

      await expect(stepController.getAll(req, res)).rejects.toThrow('Database error');
    });
  });

  describe('getById', () => {
    test('deve retornar etapa por id', async () => {
      const mockStep = { id: 1, name: 'Análise', order: 1 };
      req.params.id = '1';
      stepService.getById.mockResolvedValue(mockStep);

      await stepController.getById(req, res);

      expect(stepService.getById).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith(mockStep);
    });

    test('deve converter id string para número', async () => {
      req.params.id = '123';
      stepService.getById.mockResolvedValue({});

      await stepController.getById(req, res);

      expect(stepService.getById).toHaveBeenCalledWith(123);
    });

    test('deve retornar 404 quando etapa não existir', async () => {
      req.params.id = '999';
      stepService.getById.mockResolvedValue(null);

      await stepController.getById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Etapa não encontrada' });
    });

    test('deve retornar 404 quando retornar undefined', async () => {
      req.params.id = '999';
      stepService.getById.mockResolvedValue(undefined);

      await stepController.getById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Etapa não encontrada' });
    });
  });

  describe('create', () => {
    test('deve criar etapa com sucesso', async () => {
      const newStep = { name: 'Testes', order: 3 };
      const createdStep = { id: 3, ...newStep };
      req.body = newStep;
      stepService.create.mockResolvedValue(createdStep);

      await stepController.create(req, res);

      expect(stepService.create).toHaveBeenCalledWith(newStep);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(createdStep);
    });

    test('deve criar etapa com todos os campos', async () => {
      const newStep = { name: 'Deploy', order: 4, description: 'Publicação' };
      req.body = newStep;
      stepService.create.mockResolvedValue({ id: 4, ...newStep });

      await stepController.create(req, res);

      expect(stepService.create).toHaveBeenCalledWith(newStep);
      expect(res.status).toHaveBeenCalledWith(201);
    });

    test('deve tratar erro do service', async () => {
      req.body = { name: 'Test' };
      stepService.create.mockRejectedValue(new Error('Validation error'));

      await expect(stepController.create(req, res)).rejects.toThrow('Validation error');
    });
  });

  describe('update', () => {
    test('deve atualizar etapa com sucesso', async () => {
      const updateData = { name: 'Análise Detalhada' };
      const updatedStep = { id: 1, name: 'Análise Detalhada', order: 1 };
      req.params.id = '1';
      req.body = updateData;
      stepService.update.mockResolvedValue(updatedStep);

      await stepController.update(req, res);

      expect(stepService.update).toHaveBeenCalledWith(1, updateData);
      expect(res.json).toHaveBeenCalledWith(updatedStep);
    });

    test('deve converter id string para número', async () => {
      req.params.id = '456';
      req.body = { name: 'Atualizado' };
      stepService.update.mockResolvedValue({});

      await stepController.update(req, res);

      expect(stepService.update).toHaveBeenCalledWith(456, req.body);
    });

    test('deve permitir atualizar campo order', async () => {
      req.params.id = '1';
      req.body = { order: 5 };
      stepService.update.mockResolvedValue({});

      await stepController.update(req, res);

      expect(stepService.update).toHaveBeenCalledWith(1, { order: 5 });
    });

    test('deve retornar 404 quando etapa não existir', async () => {
      req.params.id = '999';
      req.body = { name: 'Test' };
      stepService.update.mockRejectedValue(new Error('Not found'));

      await stepController.update(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Etapa não encontrada' });
    });
  });

  describe('removeMany', () => {
    test('deve remover múltiplas etapas com sucesso', async () => {
      req.body = { ids: [1, 2, 3] };
      stepService.removeMany.mockResolvedValue({ count: 3 });

      await stepController.removeMany(req, res);

      expect(stepService.removeMany).toHaveBeenCalledWith([1, 2, 3]);
      expect(res.json).toHaveBeenCalledWith({ message: 'Etapas excluídas com sucesso' });
    });

    test('deve remover uma única etapa', async () => {
      req.body = { ids: [1] };
      stepService.removeMany.mockResolvedValue({ count: 1 });

      await stepController.removeMany(req, res);

      expect(stepService.removeMany).toHaveBeenCalledWith([1]);
      expect(res.json).toHaveBeenCalledWith({ message: 'Etapas excluídas com sucesso' });
    });

    test('deve retornar 400 quando ids não for array', async () => {
      req.body = { ids: 'not-an-array' };

      await stepController.removeMany(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Nenhum ID fornecido' });
      expect(stepService.removeMany).not.toHaveBeenCalled();
    });

    test('deve retornar 400 quando ids for array vazio', async () => {
      req.body = { ids: [] };

      await stepController.removeMany(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Nenhum ID fornecido' });
      expect(stepService.removeMany).not.toHaveBeenCalled();
    });

    test('deve retornar 400 quando ids não for fornecido', async () => {
      req.body = {};

      await stepController.removeMany(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Nenhum ID fornecido' });
    });

    test('deve retornar 500 em caso de erro no service', async () => {
      req.body = { ids: [1, 2] };
      const error = new Error('Database error');
      stepService.removeMany.mockRejectedValue(error);

      await stepController.removeMany(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Erro ao excluir etapas',
        error
      });
    });
  });
});