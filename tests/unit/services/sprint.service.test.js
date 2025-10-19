const mockPrismaClient = {
  sprint: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    deleteMany: jest.fn(),
  },
  workspace: {
    findUnique: jest.fn(),
  },
  workspaceStep: {
    findMany: jest.fn(),
  },
  task: {
    updateMany: jest.fn(),
  },
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrismaClient),
}));

const sprintService = require('../../../src/services/sprint.service');

describe('Sprint Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    test('deve retornar todas as sprints sem filtros', async () => {
      const mockSprints = [
        { id: 1, name: 'Sprint 1', workspaceId: 1, isActive: true },
        { id: 2, name: 'Sprint 2', workspaceId: 1, isActive: false },
      ];
      mockPrismaClient.sprint.findMany.mockResolvedValue(mockSprints);

      const result = await sprintService.getAll();

      expect(mockPrismaClient.sprint.findMany).toHaveBeenCalledWith({
        where: { workspaceId: undefined },
        orderBy: [
          { isActive: 'desc' },
          { activatedAt: 'desc' },
          { startDate: 'desc' },
          { id: 'desc' },
        ],
      });
      expect(result).toEqual(mockSprints);
    });

    test('deve filtrar por workspaceId', async () => {
      mockPrismaClient.sprint.findMany.mockResolvedValue([]);

      await sprintService.getAll({ workspaceId: '1' });

      expect(mockPrismaClient.sprint.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ workspaceId: 1 }),
        })
      );
    });

    test('deve filtrar por state active', async () => {
      mockPrismaClient.sprint.findMany.mockResolvedValue([]);

      await sprintService.getAll({ state: 'active' });

      expect(mockPrismaClient.sprint.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isActive: true,
            closedAt: { equals: null },
          }),
        })
      );
    });

    test('deve filtrar por state planned', async () => {
      mockPrismaClient.sprint.findMany.mockResolvedValue([]);

      await sprintService.getAll({ state: 'planned' });

      expect(mockPrismaClient.sprint.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isActive: false,
            closedAt: { equals: null },
          }),
        })
      );
    });

    test('deve filtrar por state closed', async () => {
      mockPrismaClient.sprint.findMany.mockResolvedValue([]);

      await sprintService.getAll({ state: 'closed' });

      expect(mockPrismaClient.sprint.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            closedAt: { not: null },
          }),
        })
      );
    });

    test('deve filtrar por state open', async () => {
      mockPrismaClient.sprint.findMany.mockResolvedValue([]);

      await sprintService.getAll({ state: 'open' });

      expect(mockPrismaClient.sprint.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            closedAt: { equals: null },
          }),
        })
      );
    });
  });

  describe('getById', () => {
    test('deve retornar sprint por id', async () => {
      const mockSprint = { id: 1, name: 'Sprint 1', workspaceId: 1 };
      mockPrismaClient.sprint.findUnique.mockResolvedValue(mockSprint);

      const result = await sprintService.getById(1);

      expect(mockPrismaClient.sprint.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(mockSprint);
    });

    test('deve converter id string para número', async () => {
      mockPrismaClient.sprint.findUnique.mockResolvedValue(null);

      await sprintService.getById('123');

      expect(mockPrismaClient.sprint.findUnique).toHaveBeenCalledWith({
        where: { id: 123 },
      });
    });
  });

  describe('create', () => {
    test('deve criar sprint inativa sem datas', async () => {
      const mockWorkspace = { id: 1, name: 'Workspace 1' };
      const mockCreated = {
        id: 1,
        name: 'Sprint 1',
        workspaceId: 1,
        isActive: false,
        startDate: null,
        endDate: null,
      };

      mockPrismaClient.workspace.findUnique.mockResolvedValue(mockWorkspace);
      mockPrismaClient.sprint.create.mockResolvedValue(mockCreated);

      const result = await sprintService.create({
        name: 'Sprint 1',
        workspaceId: 1,
        isActive: false,
      });

      expect(mockPrismaClient.workspace.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockPrismaClient.sprint.create).toHaveBeenCalledWith({
        data: {
          name: 'Sprint 1',
          workspaceId: 1,
          startDate: null,
          endDate: null,
          isActive: false,
          activatedAt: null,
          closedAt: null,
        },
      });
      expect(result).toEqual(mockCreated);
    });

    test('deve criar sprint ativa com datas', async () => {
      const mockWorkspace = { id: 1, name: 'Workspace 1' };
      mockPrismaClient.workspace.findUnique.mockResolvedValue(mockWorkspace);
      mockPrismaClient.sprint.create.mockResolvedValue({
        id: 1,
        name: 'Sprint 1',
        workspaceId: 1,
        isActive: true,
      });

      const parseDateSpy = jest.spyOn(require('../../../src/utils/datetime'), 'parseDateInput')
        .mockImplementation((v) => (v instanceof Date ? v : new Date(v)));

      await sprintService.create({
        name: 'Sprint 1',
        workspaceId: 1,
        isActive: true,
        startDate: '2024-01-01',
        endDate: '2024-01-15',
      });

      expect(mockPrismaClient.sprint.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          isActive: true,
          activatedAt: expect.any(Date),
        }),
      });

      parseDateSpy.mockRestore();
    });


    test('deve lançar erro se workspace não existir', async () => {
      mockPrismaClient.workspace.findUnique.mockResolvedValue(null);

      await expect(
        sprintService.create({ name: 'Sprint 1', workspaceId: 999 })
      ).rejects.toThrow('Workspace inexistente');
    });

    test('deve lançar erro ao ativar sem datas', async () => {
      mockPrismaClient.workspace.findUnique.mockResolvedValue({ id: 1 });

      await expect(
        sprintService.create({
          name: 'Sprint 1',
          workspaceId: 1,
          isActive: true,
        })
      ).rejects.toThrow('Para ativar na criação, defina início e término.');
    });
  });

  describe('update', () => {
    test('deve atualizar nome da sprint', async () => {
      const mockSprint = {
        id: 1,
        name: 'Sprint 1',
        isActive: false,
        closedAt: null,
      };
      mockPrismaClient.sprint.findUnique.mockResolvedValue(mockSprint);
      mockPrismaClient.sprint.update.mockResolvedValue({});

      await sprintService.update(1, { name: 'Sprint Atualizada' });

      expect(mockPrismaClient.sprint.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          name: 'Sprint Atualizada',
          startDate: undefined,
          endDate: undefined,
          isActive: undefined,
        },
      });
    });

    test('deve lançar erro se sprint não existir', async () => {
      mockPrismaClient.sprint.findUnique.mockResolvedValue(null);

      await expect(
        sprintService.update(999, { name: 'Test' })
      ).rejects.toThrow('Sprint inexistente');
    });

    test('deve lançar erro ao reativar sprint encerrada', async () => {
      const mockSprint = {
        id: 1,
        isActive: false,
        closedAt: new Date(),
      };
      mockPrismaClient.sprint.findUnique.mockResolvedValue(mockSprint);

      await expect(
        sprintService.update(1, { isActive: true })
      ).rejects.toThrow('Sprint encerrada não pode ser reativada.');
    });

    test('deve ativar sprint com datas existentes', async () => {
      const mockSprint = {
        id: 1,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-15'),
        isActive: false,
        closedAt: null,
        activatedAt: null,
      };
      mockPrismaClient.sprint.findUnique.mockResolvedValue(mockSprint);
      mockPrismaClient.sprint.update.mockResolvedValue({});

      await sprintService.update(1, { isActive: true });

      expect(mockPrismaClient.sprint.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: expect.objectContaining({
          isActive: true,
          activatedAt: expect.any(Date),
        }),
      });
    });

    test('deve lançar erro ao ativar sem datas', async () => {
      const mockSprint = {
        id: 1,
        startDate: null,
        endDate: null,
        isActive: false,
        closedAt: null,
      };
      mockPrismaClient.sprint.findUnique.mockResolvedValue(mockSprint);

      await expect(
        sprintService.update(1, { isActive: true })
      ).rejects.toThrow('Para ativar, defina início e término.');
    });

    test('não deve atualizar activatedAt se já existir', async () => {
      const existingDate = new Date('2024-01-01');
      const mockSprint = {
        id: 1,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-15'),
        isActive: false,
        closedAt: null,
        activatedAt: existingDate,
      };
      mockPrismaClient.sprint.findUnique.mockResolvedValue(mockSprint);
      mockPrismaClient.sprint.update.mockResolvedValue({});

      await sprintService.update(1, { isActive: true });

      expect(mockPrismaClient.sprint.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: expect.not.objectContaining({
          activatedAt: expect.any(Date),
        }),
      });
    });
  });

  describe('removeMany', () => {
    test('deve remover múltiplas sprints', async () => {
      mockPrismaClient.sprint.deleteMany.mockResolvedValue({ count: 3 });

      const result = await sprintService.removeMany([1, 2, 3]);

      expect(mockPrismaClient.sprint.deleteMany).toHaveBeenCalledWith({
        where: { id: { in: [1, 2, 3] } },
      });
      expect(result.count).toBe(3);
    });

    test('deve converter ids string para número', async () => {
      mockPrismaClient.sprint.deleteMany.mockResolvedValue({ count: 2 });

      await sprintService.removeMany(['1', '2']);

      expect(mockPrismaClient.sprint.deleteMany).toHaveBeenCalledWith({
        where: { id: { in: [1, 2] } },
      });
    });
  });

  describe('activate', () => {
    test('deve ativar sprint com datas definidas', async () => {
      const mockSprint = {
        id: 1,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-15'),
        isActive: false,
        closedAt: null,
        activatedAt: null,
      };
      mockPrismaClient.sprint.findUnique.mockResolvedValue(mockSprint);
      mockPrismaClient.sprint.update.mockResolvedValue({});

      await sprintService.activate(1);

      expect(mockPrismaClient.sprint.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          isActive: true,
          activatedAt: expect.any(Date),
        },
      });
    });

    test('deve lançar erro se sprint não existir', async () => {
      mockPrismaClient.sprint.findUnique.mockResolvedValue(null);

      await expect(sprintService.activate(999)).rejects.toThrow('Sprint inexistente');
    });

    test('deve lançar erro se sprint estiver encerrada', async () => {
      const mockSprint = {
        id: 1,
        isActive: false,
        closedAt: new Date(),
      };
      mockPrismaClient.sprint.findUnique.mockResolvedValue(mockSprint);

      await expect(sprintService.activate(1)).rejects.toThrow(
        'Sprint encerrada não pode ser reativada.'
      );
    });

    test('deve lançar erro se não tiver datas', async () => {
      const mockSprint = {
        id: 1,
        startDate: null,
        endDate: null,
        isActive: false,
        closedAt: null,
      };
      mockPrismaClient.sprint.findUnique.mockResolvedValue(mockSprint);

      await expect(sprintService.activate(1)).rejects.toThrow(
        'Defina início e término antes de ativar.'
      );
    });

    test('deve preservar activatedAt existente', async () => {
      const existingDate = new Date('2024-01-01');
      const mockSprint = {
        id: 1,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-15'),
        isActive: false,
        closedAt: null,
        activatedAt: existingDate,
      };
      mockPrismaClient.sprint.findUnique.mockResolvedValue(mockSprint);
      mockPrismaClient.sprint.update.mockResolvedValue({});

      await sprintService.activate(1);

      expect(mockPrismaClient.sprint.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          isActive: true,
          activatedAt: existingDate,
        },
      });
    });
  });

  describe('close', () => {
    beforeEach(() => {
      mockPrismaClient.workspaceStep.findMany.mockResolvedValue([
        { stepId: 1 },
        { stepId: 2 },
        { stepId: 3 },
      ]);
    });

    test('deve encerrar sprint movendo tarefas para backlog', async () => {
      const mockSprint = {
        id: 1,
        workspaceId: 1,
        endDate: new Date('2024-01-15'),
        closedAt: null,
      };
      mockPrismaClient.sprint.findUnique.mockResolvedValue(mockSprint);
      mockPrismaClient.task.updateMany.mockResolvedValue({ count: 5 });
      mockPrismaClient.sprint.update.mockResolvedValue(mockSprint);

      const result = await sprintService.close(1);

      expect(mockPrismaClient.task.updateMany).toHaveBeenCalledWith({
        where: {
          sprintId: 1,
          NOT: { stepId: 3 },
        },
        data: { sprintId: null },
      });
      expect(result.movedCount).toBe(5);
    });

    test('deve encerrar sprint movendo tarefas para outra sprint', async () => {
      const mockSprint = {
        id: 1,
        workspaceId: 1,
        endDate: new Date('2024-01-15'),
        closedAt: null,
      };
      const mockTargetSprint = {
        id: 2,
        workspaceId: 1,
        closedAt: null,
      };
      mockPrismaClient.sprint.findUnique
        .mockResolvedValueOnce(mockSprint)
        .mockResolvedValueOnce(mockTargetSprint);
      mockPrismaClient.task.updateMany.mockResolvedValue({ count: 3 });
      mockPrismaClient.sprint.update.mockResolvedValue(mockSprint);

      const result = await sprintService.close(1, {
        move: { to: 'sprint', sprintId: 2 },
      });

      expect(mockPrismaClient.task.updateMany).toHaveBeenCalledWith({
        where: {
          sprintId: 1,
          NOT: { stepId: 3 },
        },
        data: { sprintId: 2 },
      });
      expect(result.movedCount).toBe(3);
    });

    test('deve lançar erro se sprint não existir', async () => {
      mockPrismaClient.sprint.findUnique.mockResolvedValue(null);

      await expect(sprintService.close(999)).rejects.toThrow('Sprint inexistente');
    });

    test('deve lançar erro se sprint destino for de workspace diferente', async () => {
      const mockSprint = { id: 1, workspaceId: 1, closedAt: null };
      const mockTargetSprint = { id: 2, workspaceId: 2, closedAt: null };
      mockPrismaClient.sprint.findUnique
        .mockResolvedValueOnce(mockSprint)
        .mockResolvedValueOnce(mockTargetSprint);

      await expect(
        sprintService.close(1, { move: { to: 'sprint', sprintId: 2 } })
      ).rejects.toThrow('Sprint de destino inválida (diferente do workspace).');
    });

    test('deve lançar erro se sprint destino estiver encerrada', async () => {
      const mockSprint = { id: 1, workspaceId: 1, closedAt: null };
      const mockTargetSprint = { id: 2, workspaceId: 1, closedAt: new Date() };
      mockPrismaClient.sprint.findUnique
        .mockResolvedValueOnce(mockSprint)
        .mockResolvedValueOnce(mockTargetSprint);

      await expect(
        sprintService.close(1, { move: { to: 'sprint', sprintId: 2 } })
      ).rejects.toThrow('Sprint de destino está encerrada.');
    });

    test('deve usar data atual se endDate não existir', async () => {
      const mockSprint = {
        id: 1,
        workspaceId: 1,
        endDate: null,
        closedAt: null,
      };
      mockPrismaClient.sprint.findUnique.mockResolvedValue(mockSprint);
      mockPrismaClient.task.updateMany.mockResolvedValue({ count: 0 });
      mockPrismaClient.sprint.update.mockResolvedValue({});

      await sprintService.close(1);

      expect(mockPrismaClient.sprint.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          isActive: false,
          endDate: expect.any(Date),
          closedAt: expect.any(Date),
        },
      });
    });

    test('não deve mover tarefas se não houver step final', async () => {
      mockPrismaClient.workspaceStep.findMany.mockResolvedValue([]);
      const mockSprint = { id: 1, workspaceId: 1, closedAt: null };
      mockPrismaClient.sprint.findUnique.mockResolvedValue(mockSprint);
      mockPrismaClient.task.updateMany.mockResolvedValue({ count: 10 });
      mockPrismaClient.sprint.update.mockResolvedValue({});

      await sprintService.close(1);

      expect(mockPrismaClient.task.updateMany).toHaveBeenCalledWith({
        where: { sprintId: 1 },
        data: { sprintId: null },
      });
    });
  });
});