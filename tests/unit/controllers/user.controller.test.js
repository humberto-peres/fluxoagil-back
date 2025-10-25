const userController = require('../../../src/controllers/user.controller');
const userService = require('../../../src/services/user.service');

jest.mock('../../../src/services/user.service');

describe('User Controller', () => {
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
    test('deve retornar todos os usuários', async () => {
      const mockUsers = [
        { id: 1, name: 'João', email: 'joao@test.com' },
        { id: 2, name: 'Maria', email: 'maria@test.com' },
      ];
      userService.getAll.mockResolvedValue(mockUsers);

      await userController.getAll(req, res);

      expect(userService.getAll).toHaveBeenCalledWith();
      expect(res.json).toHaveBeenCalledWith(mockUsers);
    });

    test('deve retornar array vazio quando não houver usuários', async () => {
      userService.getAll.mockResolvedValue([]);

      await userController.getAll(req, res);

      expect(res.json).toHaveBeenCalledWith([]);
    });

    test('deve retornar 500 em caso de erro', async () => {
      userService.getAll.mockRejectedValue(new Error('Database error'));

      await userController.getAll(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Erro ao buscar usuários',
      });
    });
  });

  describe('getById', () => {
    test('deve retornar usuário por id', async () => {
      const mockUser = { id: 1, name: 'João', email: 'joao@test.com' };
      req.params.id = '1';
      userService.getById.mockResolvedValue(mockUser);

      await userController.getById(req, res);

      expect(userService.getById).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith(mockUser);
    });

    test('deve converter id string para número', async () => {
      req.params.id = '123';
      userService.getById.mockResolvedValue({});

      await userController.getById(req, res);

      expect(userService.getById).toHaveBeenCalledWith(123);
    });

    test('deve retornar 404 quando usuário não existir', async () => {
      req.params.id = '999';
      userService.getById.mockResolvedValue(null);

      await userController.getById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Usuário não encontrado',
      });
    });

    test('deve retornar 404 quando retornar undefined', async () => {
      req.params.id = '999';
      userService.getById.mockResolvedValue(undefined);

      await userController.getById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Usuário não encontrado',
      });
    });

    test('deve retornar 500 em caso de erro', async () => {
      req.params.id = '1';
      userService.getById.mockRejectedValue(new Error('Database error'));

      await userController.getById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Erro ao buscar usuário',
      });
    });
  });

  describe('create', () => {
    test('deve criar usuário com sucesso', async () => {
      const newUser = {
        name: 'Carlos',
        email: 'carlos@test.com',
        password: '123456',
      };
      req.body = newUser;
      userService.create.mockResolvedValue({ id: 5, ...newUser });

      await userController.create(req, res);

      expect(userService.create).toHaveBeenCalledWith(newUser);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalled();
    });

    test('deve retornar 400 para senha inválida', async () => {
      req.body = { name: 'Test', email: 'test@test.com', password: '123' };
      const error = new Error('Senha obrigatória com no mínimo 6 caracteres.');
      error.status = 400;
      userService.create.mockRejectedValue(error);

      await userController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Senha obrigatória com no mínimo 6 caracteres.',
      });
    });

    test('deve retornar 409 para violação de unicidade', async () => {
      req.body = { name: 'Test', email: 'duplicate@test.com', password: '123456' };
      const error = new Error('Violação de unicidade em: email.');
      error.status = 409;
      userService.create.mockRejectedValue(error);

      await userController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Violação de unicidade em: email.',
      });
    });

    test('deve retornar 500 para erro genérico', async () => {
      req.body = { name: 'Test' };
      userService.create.mockRejectedValue(new Error('Unknown error'));

      await userController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Unknown error',
      });
    });
  });

  describe('update', () => {
    test('deve atualizar usuário com sucesso', async () => {
      const updateData = { name: 'João Atualizado' };
      req.params.id = '1';
      req.body = updateData;
      userService.update.mockResolvedValue({ id: 1, ...updateData });

      await userController.update(req, res);

      expect(userService.update).toHaveBeenCalledWith(1, updateData);
      expect(res.json).toHaveBeenCalled();
    });

    test('deve converter id string para número', async () => {
      req.params.id = '456';
      req.body = { name: 'Test' };
      userService.update.mockResolvedValue({});

      await userController.update(req, res);

      expect(userService.update).toHaveBeenCalledWith(456, req.body);
    });

    test('deve retornar 400 para senha inválida', async () => {
      req.params.id = '1';
      req.body = { password: '123' };
      const error = new Error('Senha deve ter no mínimo 6 caracteres.');
      error.status = 400;
      userService.update.mockRejectedValue(error);

      await userController.update(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Senha deve ter no mínimo 6 caracteres.',
      });
    });

    test('deve retornar 409 para violação de unicidade', async () => {
      req.params.id = '1';
      req.body = { email: 'duplicate@test.com' };
      const error = new Error('Violação de unicidade em: email.');
      error.status = 409;
      userService.update.mockRejectedValue(error);

      await userController.update(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
    });

    test('deve retornar 404 para erro genérico sem status', async () => {
      req.params.id = '999';
      req.body = { name: 'Test' };
      userService.update.mockRejectedValue(new Error('Not found'));

      await userController.update(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Not found',
      });
    });
  });

  describe('removeMany', () => {
    test('deve remover múltiplos usuários com sucesso', async () => {
      req.body = { ids: [1, 2, 3] };
      userService.removeMany.mockResolvedValue({ count: 3 });

      await userController.removeMany(req, res);

      expect(userService.removeMany).toHaveBeenCalledWith([1, 2, 3]);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Usuários excluídos com sucesso',
      });
    });

    test('deve remover um único usuário', async () => {
      req.body = { ids: [1] };
      userService.removeMany.mockResolvedValue({ count: 1 });

      await userController.removeMany(req, res);

      expect(userService.removeMany).toHaveBeenCalledWith([1]);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Usuários excluídos com sucesso',
      });
    });

    test('deve retornar 400 quando ids não for array', async () => {
      req.body = { ids: 'not-an-array' };

      await userController.removeMany(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Nenhum ID fornecido para exclusão',
      });
      expect(userService.removeMany).not.toHaveBeenCalled();
    });

    test('deve retornar 400 quando ids for array vazio', async () => {
      req.body = { ids: [] };

      await userController.removeMany(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Nenhum ID fornecido para exclusão',
      });
      expect(userService.removeMany).not.toHaveBeenCalled();
    });

    test('deve retornar 400 quando ids não for fornecido', async () => {
      req.body = {};

      await userController.removeMany(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Nenhum ID fornecido para exclusão',
      });
    });

    test('deve converter ids para números', async () => {
      req.body = { ids: ['1', '2', '3'] };
      userService.removeMany.mockResolvedValue({ count: 3 });

      await userController.removeMany(req, res);

      expect(userService.removeMany).toHaveBeenCalledWith([1, 2, 3]);
    });

    test('deve retornar 500 quando tentar excluir administrador', async () => {
      req.body = { ids: [1] };
      const error = new Error('Não é permitido excluir um administrador');
      error.status = 403;
      userService.removeMany.mockRejectedValue(error);

      await userController.removeMany(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Não é permitido excluir um administrador',
        error: expect.any(String),
      });
    });

    test('deve retornar 500 quando usuário tiver tarefas associadas', async () => {
      req.body = { ids: [2] };
      const error = new Error('Usuários com tarefas associadas não podem ser excluídos: João');
      error.status = 400;
      userService.removeMany.mockRejectedValue(error);

      await userController.removeMany(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: expect.stringContaining('tarefas associadas'),
        error: expect.any(String),
      });
    });

    test('deve retornar 500 quando usuário for membro de equipe', async () => {
      req.body = { ids: [3] };
      const error = new Error('Usuários que são membros de equipes não podem ser excluídos: Maria');
      error.status = 400;
      userService.removeMany.mockRejectedValue(error);

      await userController.removeMany(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: expect.stringContaining('membros de equipes'),
        error: expect.any(String),
      });
    });

    test('deve retornar 500 em caso de erro genérico', async () => {
      req.body = { ids: [1] };
      const error = new Error('Database error');
      userService.removeMany.mockRejectedValue(error);

      await userController.removeMany(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Database error',
        error: 'Error: Database error',
      });
    });
  });
});