const mockPrismaClient = {
  workspace: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    deleteMany: jest.fn(),
  },
  workspaceStep: {
    deleteMany: jest.fn(),
  },
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrismaClient),
}));

const workspaceService = require('../../../src/services/workspace.service');

describe('Workspace Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    test('deve retornar todos os workspaces formatados', async () => {
      const mockWorkspaces = [
        {
          id: 1,
          name: 'Workspace A',
          key: 'WSA',
          methodology: 'Scrum',
          teamId: 1,
          team: {
            name: 'Team Alpha',
            members: [
              { user: { name: 'João' } },
              { user: { name: 'Maria' } },
            ],
          },
          steps: [
            { stepId: 1, step: { name: 'To Do' }, order: 1 },
            { stepId: 2, step: { name: 'Done' }, order: 2 },
          ],
        },
      ];
      mockPrismaClient.workspace.findMany.mockResolvedValue(mockWorkspaces);

      const result = await workspaceService.getAll();

      expect(mockPrismaClient.workspace.findMany).toHaveBeenCalledWith({
        include: {
          steps: { include: { step: true }, orderBy: { order: 'asc' } },
          team: { include: { members: { include: { user: true } } } },
        },
      });
      expect(result).toEqual([
        {
          id: 1,
          name: 'Workspace A',
          key: 'WSA',
          methodology: 'Scrum',
          teamId: 1,
          teamName: 'Team Alpha',
          members: ['João', 'Maria'],
          steps: [
            { stepId: 1, name: 'To Do', order: 1 },
            { stepId: 2, name: 'Done', order: 2 },
          ],
        },
      ]);
    });

    test('deve retornar array vazio quando não houver workspaces', async () => {
      mockPrismaClient.workspace.findMany.mockResolvedValue([]);

      const result = await workspaceService.getAll();

      expect(result).toEqual([]);
    });

    test('deve tratar workspace sem team', async () => {
      const mockWorkspaces = [
        {
          id: 1,
          name: 'Workspace',
          key: 'WS',
          methodology: 'Kanban',
          teamId: null,
          team: null,
          steps: [],
        },
      ];
      mockPrismaClient.workspace.findMany.mockResolvedValue(mockWorkspaces);

      const result = await workspaceService.getAll();

      expect(result[0].teamName).toBe('');
      expect(result[0].members).toEqual([]);
    });
  });

  describe('getAllowedForUser', () => {
    test('deve retornar workspaces permitidos para o usuário', async () => {
      const mockWorkspaces = [
        { id: 1, name: 'Workspace A', methodology: 'Scrum', key: 'WSA' },
        { id: 2, name: 'Workspace B', methodology: 'Kanban', key: 'WSB' },
      ];
      mockPrismaClient.workspace.findMany.mockResolvedValue(mockWorkspaces);

      const result = await workspaceService.getAllowedForUser(1);

      expect(mockPrismaClient.workspace.findMany).toHaveBeenCalledWith({
        where: {
          team: {
            members: {
              some: { userId: 1 },
            },
          },
        },
        select: {
          id: true,
          name: true,
          methodology: true,
          key: true,
        },
        orderBy: { name: 'asc' },
      });
      expect(result).toEqual(mockWorkspaces);
    });

    test('deve retornar array vazio quando usuário não tiver workspaces', async () => {
      mockPrismaClient.workspace.findMany.mockResolvedValue([]);

      const result = await workspaceService.getAllowedForUser(999);

      expect(result).toEqual([]);
    });

    test('deve converter userId para número', async () => {
      mockPrismaClient.workspace.findMany.mockResolvedValue([]);

      await workspaceService.getAllowedForUser('5');

      expect(mockPrismaClient.workspace.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            team: {
              members: {
                some: { userId: 5 },
              },
            },
          },
        })
      );
    });
  });

  describe('canAccess', () => {
    test('deve retornar true quando usuário tiver acesso', async () => {
      mockPrismaClient.workspace.findFirst.mockResolvedValue({ id: 1 });

      const result = await workspaceService.canAccess(1, 1);

      expect(mockPrismaClient.workspace.findFirst).toHaveBeenCalledWith({
        where: {
          id: 1,
          team: { members: { some: { userId: 1 } } },
        },
        select: { id: true },
      });
      expect(result).toBe(true);
    });

    test('deve retornar false quando usuário não tiver acesso', async () => {
      mockPrismaClient.workspace.findFirst.mockResolvedValue(null);

      const result = await workspaceService.canAccess(999, 1);

      expect(result).toBe(false);
    });

    test('deve converter userId e workspaceId para número', async () => {
      mockPrismaClient.workspace.findFirst.mockResolvedValue(null);

      await workspaceService.canAccess('5', '10');

      expect(mockPrismaClient.workspace.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            id: 10,
            team: { members: { some: { userId: 5 } } },
          },
        })
      );
    });
  });

  describe('getById', () => {
    test('deve retornar workspace por id', async () => {
      const mockWorkspace = {
        id: 1,
        name: 'Workspace A',
        key: 'WSA',
        steps: [{ stepId: 1, step: { name: 'To Do' }, order: 1 }],
      };
      mockPrismaClient.workspace.findUnique.mockResolvedValue(mockWorkspace);

      const result = await workspaceService.getById(1);

      expect(mockPrismaClient.workspace.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          steps: {
            include: { step: true },
            orderBy: { order: 'asc' },
          },
        },
      });
      expect(result).toEqual(mockWorkspace);
    });

    test('deve retornar null quando workspace não existir', async () => {
      mockPrismaClient.workspace.findUnique.mockResolvedValue(null);

      const result = await workspaceService.getById(999);

      expect(result).toBeNull();
    });

    test('deve converter id para número', async () => {
      mockPrismaClient.workspace.findUnique.mockResolvedValue({});

      await workspaceService.getById('5');

      expect(mockPrismaClient.workspace.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 5 },
        })
      );
    });
  });

  describe('create', () => {
    test('deve criar workspace com sucesso', async () => {
      const newWorkspace = {
        name: 'Project Alpha',
        key: 'alpha',
        methodology: 'Scrum',
        teamId: 1,
        steps: [
          { stepId: 1, order: 1 },
          { stepId: 2, order: 2 },
        ],
      };
      mockPrismaClient.workspace.create.mockResolvedValue({ id: 5, ...newWorkspace });

      const result = await workspaceService.create(newWorkspace);

      expect(mockPrismaClient.workspace.create).toHaveBeenCalledWith({
        data: {
          name: 'Project Alpha',
          key: 'ALPHA',
          methodology: 'Scrum',
          teamId: 1,
          steps: {
            create: [
              { stepId: 1, order: 1 },
              { stepId: 2, order: 2 },
            ],
          },
        },
      });
      expect(result).toHaveProperty('id', 5);
    });

    test('deve converter key para uppercase', async () => {
      const newWorkspace = {
        name: 'Test',
        key: 'test',
        methodology: 'Kanban',
        teamId: 1,
        steps: [{ stepId: 1, order: 1 }],
      };
      mockPrismaClient.workspace.create.mockResolvedValue({});

      await workspaceService.create(newWorkspace);

      expect(mockPrismaClient.workspace.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            key: 'TEST',
          }),
        })
      );
    });

    test('deve lançar erro quando key for inválido (números)', async () => {
      const newWorkspace = {
        name: 'Test',
        key: 'ABC123',
        steps: [],
      };

      await expect(workspaceService.create(newWorkspace)).rejects.toThrow(
        'Código inválido: use apenas letras (1 a 5).'
      );
    });

    test('deve lançar erro quando key tiver mais de 5 caracteres', async () => {
      const newWorkspace = {
        name: 'Test',
        key: 'ABCDEF',
        steps: [],
      };

      await expect(workspaceService.create(newWorkspace)).rejects.toThrow(
        'Código inválido: use apenas letras (1 a 5).'
      );
    });

    test('deve lançar erro quando key for vazio', async () => {
      const newWorkspace = {
        name: 'Test',
        key: '',
        steps: [],
      };

      await expect(workspaceService.create(newWorkspace)).rejects.toThrow(
        'Código inválido: use apenas letras (1 a 5).'
      );
    });

    test('deve lançar erro quando houver steps duplicados', async () => {
      const newWorkspace = {
        name: 'Test',
        key: 'TEST',
        steps: [
          { stepId: 1, order: 1 },
          { stepId: 1, order: 2 },
        ],
      };

      await expect(workspaceService.create(newWorkspace)).rejects.toThrow(
        'Etapas duplicadas não são permitidas'
      );
    });
  });

  describe('update', () => {
    test('deve atualizar workspace com sucesso', async () => {
      const updateData = {
        name: 'Updated Name',
        methodology: 'Kanban',
        teamId: 2,
        key: 'upd',
        steps: [{ stepId: 3, order: 1 }],
      };
      mockPrismaClient.workspaceStep.deleteMany.mockResolvedValue({});
      mockPrismaClient.workspace.update.mockResolvedValue({ id: 1, ...updateData });

      const result = await workspaceService.update(1, updateData);

      expect(mockPrismaClient.workspaceStep.deleteMany).toHaveBeenCalledWith({
        where: { workspaceId: 1 },
      });
      expect(mockPrismaClient.workspace.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          name: 'Updated Name',
          methodology: 'Kanban',
          teamId: 2,
          key: 'UPD',
          steps: {
            create: [{ stepId: 3, order: 1 }],
          },
        },
      });
      expect(result).toHaveProperty('id', 1);
    });

    test('deve deletar steps antigos antes de atualizar', async () => {
      const updateData = {
        name: 'Test',
        steps: [{ stepId: 1, order: 1 }],
      };
      mockPrismaClient.workspaceStep.deleteMany.mockResolvedValue({});
      mockPrismaClient.workspace.update.mockResolvedValue({});

      await workspaceService.update(5, updateData);

      expect(mockPrismaClient.workspaceStep.deleteMany).toHaveBeenCalledWith({
        where: { workspaceId: 5 },
      });
    });

    test('não deve incluir key no update quando não fornecido', async () => {
      const updateData = {
        name: 'Test',
        steps: [{ stepId: 1, order: 1 }],
      };
      mockPrismaClient.workspaceStep.deleteMany.mockResolvedValue({});
      mockPrismaClient.workspace.update.mockResolvedValue({});

      await workspaceService.update(1, updateData);

      expect(mockPrismaClient.workspace.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: expect.not.objectContaining({
          key: expect.any(String),
        }),
      });
    });

    test('deve converter key para uppercase quando fornecido', async () => {
      const updateData = {
        name: 'Test',
        key: 'new',
        steps: [{ stepId: 1, order: 1 }],
      };
      mockPrismaClient.workspaceStep.deleteMany.mockResolvedValue({});
      mockPrismaClient.workspace.update.mockResolvedValue({});

      await workspaceService.update(1, updateData);

      expect(mockPrismaClient.workspace.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            key: 'NEW',
          }),
        })
      );
    });

    test('deve lançar erro quando key for inválido', async () => {
      const updateData = {
        name: 'Test',
        key: '123',
        steps: [],
      };

      await expect(workspaceService.update(1, updateData)).rejects.toThrow(
        'Código inválido: use apenas letras (1 a 5).'
      );
    });

    test('deve lançar erro quando houver steps duplicados', async () => {
      const updateData = {
        name: 'Test',
        steps: [
          { stepId: 2, order: 1 },
          { stepId: 2, order: 2 },
        ],
      };

      await expect(workspaceService.update(1, updateData)).rejects.toThrow(
        'Etapas duplicadas não são permitidas'
      );
    });
  });

  describe('deleteMany', () => {
    test('deve remover múltiplos workspaces', async () => {
      const idsToRemove = [1, 2, 3];
      mockPrismaClient.workspace.deleteMany.mockResolvedValue({ count: 3 });

      const result = await workspaceService.deleteMany(idsToRemove);

      expect(mockPrismaClient.workspace.deleteMany).toHaveBeenCalledWith({
        where: { id: { in: [1, 2, 3] } },
      });
      expect(result.count).toBe(3);
    });

    test('deve remover um único workspace', async () => {
      mockPrismaClient.workspace.deleteMany.mockResolvedValue({ count: 1 });

      await workspaceService.deleteMany([1]);

      expect(mockPrismaClient.workspace.deleteMany).toHaveBeenCalledWith({
        where: { id: { in: [1] } },
      });
    });

    test('deve funcionar com array vazio', async () => {
      mockPrismaClient.workspace.deleteMany.mockResolvedValue({ count: 0 });

      const result = await workspaceService.deleteMany([]);

      expect(result.count).toBe(0);
    });
  });
});