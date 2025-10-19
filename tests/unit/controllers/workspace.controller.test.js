const workspaceController = require('../../../src/controllers/workspace.controller');
const workspaceService = require('../../../src/services/workspace.service');

jest.mock('../../../src/services/workspace.service');

describe('Workspace Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      query: {},
      params: {},
      body: {},
      user: { id: 1 },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    test('deve retornar todos os workspaces', async () => {
      const mockWorkspaces = [
        { id: 1, name: 'Workspace A', key: 'WSA' },
        { id: 2, name: 'Workspace B', key: 'WSB' },
      ];
      workspaceService.getAll.mockResolvedValue(mockWorkspaces);

      await workspaceController.getAll(req, res);

      expect(workspaceService.getAll).toHaveBeenCalledWith();
      expect(res.json).toHaveBeenCalledWith(mockWorkspaces);
    });

    test('deve retornar array vazio quando não houver workspaces', async () => {
      workspaceService.getAll.mockResolvedValue([]);

      await workspaceController.getAll(req, res);

      expect(res.json).toHaveBeenCalledWith([]);
    });

    test('deve retornar 500 em caso de erro', async () => {
      const error = new Error('Database error');
      workspaceService.getAll.mockRejectedValue(error);

      await workspaceController.getAll(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Erro ao buscar workspaces',
        error,
      });
    });
  });

  describe('getAllowedForUser', () => {
    test('deve retornar workspaces permitidos para o usuário', async () => {
      const mockWorkspaces = [
        { id: 1, name: 'Workspace A' },
        { id: 2, name: 'Workspace B' },
      ];
      workspaceService.getAllowedForUser.mockResolvedValue(mockWorkspaces);

      await workspaceController.getAllowedForUser(req, res);

      expect(workspaceService.getAllowedForUser).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith(mockWorkspaces);
    });

    test('deve usar req.user.id', async () => {
      req.user.id = 10;
      workspaceService.getAllowedForUser.mockResolvedValue([]);

      await workspaceController.getAllowedForUser(req, res);

      expect(workspaceService.getAllowedForUser).toHaveBeenCalledWith(10);
    });

    test('deve retornar 500 em caso de erro', async () => {
      const error = new Error('Query failed');
      workspaceService.getAllowedForUser.mockRejectedValue(error);

      await workspaceController.getAllowedForUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Erro ao buscar workspaces do usuário',
        error: 'Error: Query failed',
      });
    });
  });

  describe('canAccess', () => {
    test('deve retornar allowed true quando usuário tiver acesso', async () => {
      req.params.id = '1';
      workspaceService.canAccess.mockResolvedValue(true);

      await workspaceController.canAccess(req, res);

      expect(workspaceService.canAccess).toHaveBeenCalledWith(1, 1);
      expect(res.json).toHaveBeenCalledWith({ allowed: true });
    });

    test('deve retornar allowed false quando usuário não tiver acesso', async () => {
      req.params.id = '5';
      workspaceService.canAccess.mockResolvedValue(false);

      await workspaceController.canAccess(req, res);

      expect(res.json).toHaveBeenCalledWith({ allowed: false });
    });

    test('deve converter id para número', async () => {
      req.params.id = '123';
      workspaceService.canAccess.mockResolvedValue(false);

      await workspaceController.canAccess(req, res);

      expect(workspaceService.canAccess).toHaveBeenCalledWith(1, 123);
    });

    test('deve retornar 500 em caso de erro', async () => {
      req.params.id = '1';
      workspaceService.canAccess.mockRejectedValue(new Error('Error'));

      await workspaceController.canAccess(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Erro ao checar acesso',
      });
    });
  });

  describe('getById', () => {
    test('deve retornar workspace por id', async () => {
      const mockWorkspace = { id: 1, name: 'Workspace A', key: 'WSA' };
      req.params.id = '1';
      workspaceService.getById.mockResolvedValue(mockWorkspace);

      await workspaceController.getById(req, res);

      expect(workspaceService.getById).toHaveBeenCalledWith('1');
      expect(res.json).toHaveBeenCalledWith(mockWorkspace);
    });

    test('deve retornar 404 quando workspace não existir', async () => {
      req.params.id = '999';
      workspaceService.getById.mockResolvedValue(null);

      await workspaceController.getById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Workspace não encontrado',
      });
    });

    test('deve retornar 404 quando retornar undefined', async () => {
      req.params.id = '999';
      workspaceService.getById.mockResolvedValue(undefined);

      await workspaceController.getById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Workspace não encontrado',
      });
    });

    test('deve retornar 500 em caso de erro', async () => {
      req.params.id = '1';
      workspaceService.getById.mockRejectedValue(new Error('Error'));

      await workspaceController.getById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Erro ao buscar workspace',
      });
    });
  });

  describe('create', () => {
    test('deve criar workspace com sucesso', async () => {
      const newWorkspace = {
        name: 'Project Alpha',
        key: 'ALPHA',
        methodology: 'Scrum',
        teamId: 1,
        steps: [{ stepId: 1, order: 1 }],
      };
      req.body = newWorkspace;
      workspaceService.create.mockResolvedValue({ id: 5, ...newWorkspace });

      await workspaceController.create(req, res);

      expect(workspaceService.create).toHaveBeenCalledWith(newWorkspace);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalled();
    });

    test('deve criar workspace com steps', async () => {
      const newWorkspace = {
        name: 'Test',
        key: 'TEST',
        steps: [
          { stepId: 1, order: 1 },
          { stepId: 2, order: 2 },
        ],
      };
      req.body = newWorkspace;
      workspaceService.create.mockResolvedValue({ id: 1, ...newWorkspace });

      await workspaceController.create(req, res);

      expect(workspaceService.create).toHaveBeenCalledWith(newWorkspace);
      expect(res.status).toHaveBeenCalledWith(201);
    });

    test('deve retornar 400 quando key for inválido', async () => {
      req.body = { name: 'Test', key: '123' };
      workspaceService.create.mockRejectedValue(
        new Error('Código inválido: use apenas letras (1 a 5).')
      );

      await workspaceController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Código inválido: use apenas letras (1 a 5).',
      });
    });

    test('deve retornar 400 quando houver steps duplicados', async () => {
      req.body = {
        name: 'Test',
        key: 'TEST',
        steps: [
          { stepId: 1, order: 1 },
          { stepId: 1, order: 2 },
        ],
      };
      workspaceService.create.mockRejectedValue(
        new Error('Etapas duplicadas não são permitidas')
      );

      await workspaceController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Etapas duplicadas não são permitidas',
      });
    });
  });

  describe('update', () => {
    test('deve atualizar workspace com sucesso', async () => {
      const updateData = {
        name: 'Updated Name',
        key: 'UPD',
        steps: [{ stepId: 2, order: 1 }],
      };
      req.params.id = '1';
      req.body = updateData;
      workspaceService.update.mockResolvedValue({ id: 1, ...updateData });

      await workspaceController.update(req, res);

      expect(workspaceService.update).toHaveBeenCalledWith(1, updateData);
      expect(res.json).toHaveBeenCalled();
    });

    test('deve converter id string para número', async () => {
      req.params.id = '456';
      req.body = { name: 'Test' };
      workspaceService.update.mockResolvedValue({});

      await workspaceController.update(req, res);

      expect(workspaceService.update).toHaveBeenCalledWith(456, req.body);
    });

    test('deve permitir atualizar apenas alguns campos', async () => {
      req.params.id = '1';
      req.body = { name: 'New Name' };
      workspaceService.update.mockResolvedValue({});

      await workspaceController.update(req, res);

      expect(workspaceService.update).toHaveBeenCalledWith(1, { name: 'New Name' });
    });

    test('deve retornar 400 quando key for inválido', async () => {
      req.params.id = '1';
      req.body = { key: 'INVALID123' };
      workspaceService.update.mockRejectedValue(
        new Error('Código inválido: use apenas letras (1 a 5).')
      );

      await workspaceController.update(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Código inválido: use apenas letras (1 a 5).',
      });
    });

    test('deve retornar 400 quando houver steps duplicados', async () => {
      req.params.id = '1';
      req.body = {
        steps: [
          { stepId: 3, order: 1 },
          { stepId: 3, order: 2 },
        ],
      };
      workspaceService.update.mockRejectedValue(
        new Error('Etapas duplicadas não são permitidas')
      );

      await workspaceController.update(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Etapas duplicadas não são permitidas',
      });
    });
  });

  describe('deleteMany', () => {
    test('deve remover múltiplos workspaces com sucesso', async () => {
      req.body = { ids: [1, 2, 3] };
      workspaceService.deleteMany.mockResolvedValue({ count: 3 });

      await workspaceController.deleteMany(req, res);

      expect(workspaceService.deleteMany).toHaveBeenCalledWith([1, 2, 3]);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Workspaces excluídos com sucesso',
      });
    });

    test('deve remover um único workspace', async () => {
      req.body = { ids: [1] };
      workspaceService.deleteMany.mockResolvedValue({ count: 1 });

      await workspaceController.deleteMany(req, res);

      expect(workspaceService.deleteMany).toHaveBeenCalledWith([1]);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Workspaces excluídos com sucesso',
      });
    });

    test('deve funcionar com array vazio', async () => {
      req.body = { ids: [] };
      workspaceService.deleteMany.mockResolvedValue({ count: 0 });

      await workspaceController.deleteMany(req, res);

      expect(workspaceService.deleteMany).toHaveBeenCalledWith([]);
    });

    test('deve retornar 500 em caso de erro', async () => {
      req.body = { ids: [1] };
      workspaceService.deleteMany.mockRejectedValue(new Error('Delete failed'));

      await workspaceController.deleteMany(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Erro ao excluir workspaces',
      });
    });
  });
});