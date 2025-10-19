const teamController = require('../../../src/controllers/team.controller');
const teamService = require('../../../src/services/team.service');

jest.mock('../../../src/services/team.service');

describe('Team Controller', () => {
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
    test('deve retornar todas as equipes', async () => {
      const mockTeams = [
        { id: 1, name: 'Dev Team' },
        { id: 2, name: 'QA Team' },
      ];
      teamService.getAll.mockResolvedValue(mockTeams);

      await teamController.getAll(req, res);

      expect(teamService.getAll).toHaveBeenCalledWith();
      expect(res.json).toHaveBeenCalledWith(mockTeams);
    });

    test('deve retornar array vazio quando não houver equipes', async () => {
      teamService.getAll.mockResolvedValue([]);

      await teamController.getAll(req, res);

      expect(res.json).toHaveBeenCalledWith([]);
    });

    test('deve tratar erro do service', async () => {
      teamService.getAll.mockRejectedValue(new Error('Database error'));

      await expect(teamController.getAll(req, res)).rejects.toThrow('Database error');
    });
  });

  describe('getById', () => {
    test('deve retornar equipe por id', async () => {
      const mockTeam = { id: 1, name: 'Dev Team' };
      req.params.id = '1';
      teamService.getById.mockResolvedValue(mockTeam);

      await teamController.getById(req, res);

      expect(teamService.getById).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith(mockTeam);
    });

    test('deve converter id string para número', async () => {
      req.params.id = '123';
      teamService.getById.mockResolvedValue({});

      await teamController.getById(req, res);

      expect(teamService.getById).toHaveBeenCalledWith(123);
    });

    test('deve retornar 404 quando equipe não existir', async () => {
      req.params.id = '999';
      teamService.getById.mockResolvedValue(null);

      await teamController.getById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Equipe não encontrada' });
    });

    test('deve retornar 404 quando retornar undefined', async () => {
      req.params.id = '999';
      teamService.getById.mockResolvedValue(undefined);

      await teamController.getById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Equipe não encontrada' });
    });

    test('deve retornar 500 em caso de erro', async () => {
      req.params.id = '1';
      const error = new Error('Database connection failed');
      teamService.getById.mockRejectedValue(error);

      await teamController.getById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Erro ao buscar equipe',
        error: 'Database connection failed',
      });
    });
  });

  describe('create', () => {
    test('deve criar equipe com sucesso', async () => {
      const newTeam = { name: 'Mobile Team' };
      const createdTeam = { id: 4, ...newTeam };
      req.body = newTeam;
      teamService.create.mockResolvedValue(createdTeam);

      await teamController.create(req, res);

      expect(teamService.create).toHaveBeenCalledWith(newTeam);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(createdTeam);
    });

    test('deve criar equipe com nome específico', async () => {
      const newTeam = { name: 'Backend Team' };
      req.body = newTeam;
      teamService.create.mockResolvedValue({ id: 5, ...newTeam });

      await teamController.create(req, res);

      expect(teamService.create).toHaveBeenCalledWith(newTeam);
      expect(res.status).toHaveBeenCalledWith(201);
    });

    test('deve retornar 400 em caso de erro', async () => {
      req.body = { name: 'Test' };
      const error = new Error('Nome já existe');
      teamService.create.mockRejectedValue(error);

      await teamController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Erro ao criar equipe',
        error: 'Nome já existe',
      });
    });
  });

  describe('update', () => {
    test('deve atualizar equipe com sucesso', async () => {
      const updateData = { name: 'Updated Team' };
      const updatedTeam = { id: 1, name: 'Updated Team' };
      req.params.id = '1';
      req.body = updateData;
      teamService.update.mockResolvedValue(updatedTeam);

      await teamController.update(req, res);

      expect(teamService.update).toHaveBeenCalledWith(1, updateData);
      expect(res.json).toHaveBeenCalledWith(updatedTeam);
    });

    test('deve converter id string para número', async () => {
      req.params.id = '456';
      req.body = { name: 'Test' };
      teamService.update.mockResolvedValue({});

      await teamController.update(req, res);

      expect(teamService.update).toHaveBeenCalledWith(456, req.body);
    });

    test('deve permitir atualizar apenas o nome', async () => {
      req.params.id = '1';
      req.body = { name: 'New Name' };
      teamService.update.mockResolvedValue({});

      await teamController.update(req, res);

      expect(teamService.update).toHaveBeenCalledWith(1, { name: 'New Name' });
    });

    test('deve retornar 400 em caso de erro', async () => {
      req.params.id = '1';
      req.body = { name: 'Test' };
      const error = new Error('Equipe não encontrada');
      teamService.update.mockRejectedValue(error);

      await teamController.update(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Erro ao atualizar equipe',
        error: 'Equipe não encontrada',
      });
    });
  });

  describe('removeMany', () => {
    test('deve remover múltiplas equipes com sucesso', async () => {
      req.body = { ids: [1, 2, 3] };
      teamService.removeMany.mockResolvedValue({ count: 3 });

      await teamController.removeMany(req, res);

      expect(teamService.removeMany).toHaveBeenCalledWith([1, 2, 3]);
      expect(res.json).toHaveBeenCalledWith({ message: 'Equipes excluídas com sucesso' });
    });

    test('deve remover uma única equipe', async () => {
      req.body = { ids: [1] };
      teamService.removeMany.mockResolvedValue({ count: 1 });

      await teamController.removeMany(req, res);

      expect(teamService.removeMany).toHaveBeenCalledWith([1]);
      expect(res.json).toHaveBeenCalledWith({ message: 'Equipes excluídas com sucesso' });
    });

    test('deve retornar 400 quando ids não for array', async () => {
      req.body = { ids: 'not-an-array' };

      await teamController.removeMany(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Nenhum ID fornecido para exclusão',
      });
      expect(teamService.removeMany).not.toHaveBeenCalled();
    });

    test('deve retornar 400 quando ids for array vazio', async () => {
      req.body = { ids: [] };

      await teamController.removeMany(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Nenhum ID fornecido para exclusão',
      });
      expect(teamService.removeMany).not.toHaveBeenCalled();
    });

    test('deve retornar 400 quando ids não for fornecido', async () => {
      req.body = {};

      await teamController.removeMany(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Nenhum ID fornecido para exclusão',
      });
    });

    test('deve converter ids para números', async () => {
      req.body = { ids: ['1', '2', '3'] };
      teamService.removeMany.mockResolvedValue({ count: 3 });

      await teamController.removeMany(req, res);

      expect(teamService.removeMany).toHaveBeenCalledWith([1, 2, 3]);
    });

    test('deve retornar 500 em caso de erro no service', async () => {
      req.body = { ids: [1, 2] };
      const error = new Error('Falha ao excluir');
      teamService.removeMany.mockRejectedValue(error);

      await teamController.removeMany(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Erro ao excluir equipes',
        error: 'Falha ao excluir',
      });
    });
  });
});