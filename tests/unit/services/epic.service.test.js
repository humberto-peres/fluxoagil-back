const mockPrismaClient = {
  epic: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    deleteMany: jest.fn(),
  },
  workspace: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  $transaction: jest.fn(),
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrismaClient),
}));

const epicService = require('../../../src/services/epic.service');

describe('Epic Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    test('deve retornar todos os épicos sem filtros', async () => {
      const mockEpics = [
        { id: 1, key: 'ALPHA-E1', title: 'Epic 1', workspaceId: 1 },
        { id: 2, key: 'ALPHA-E2', title: 'Epic 2', workspaceId: 1 },
      ];
      mockPrismaClient.epic.findMany.mockResolvedValue(mockEpics);

      const result = await epicService.getAll({});

      expect(mockPrismaClient.epic.findMany).toHaveBeenCalledWith({
        where: {},
        include: { priority: true, _count: { select: { tasks: true } } },
        orderBy: { id: 'desc' },
      });
      expect(result).toEqual(mockEpics);
    });

    test('deve filtrar por workspaceId', async () => {
      const mockEpics = [{ id: 1, key: 'ALPHA-E1', title: 'Epic 1', workspaceId: 1 }];
      mockPrismaClient.epic.findMany.mockResolvedValue(mockEpics);

      await epicService.getAll({ workspaceId: '1' });

      expect(mockPrismaClient.epic.findMany).toHaveBeenCalledWith({
        where: { workspaceId: 1 },
        include: { priority: true, _count: { select: { tasks: true } } },
        orderBy: { id: 'desc' },
      });
    });

    test('deve filtrar por status', async () => {
      const mockEpics = [{ id: 1, key: 'ALPHA-E1', status: 'open' }];
      mockPrismaClient.epic.findMany.mockResolvedValue(mockEpics);

      await epicService.getAll({ status: 'open' });

      expect(mockPrismaClient.epic.findMany).toHaveBeenCalledWith({
        where: { status: 'open' },
        include: { priority: true, _count: { select: { tasks: true } } },
        orderBy: { id: 'desc' },
      });
    });

    test('deve filtrar por workspaceId e status', async () => {
      const mockEpics = [{ id: 1, workspaceId: 1, status: 'open' }];
      mockPrismaClient.epic.findMany.mockResolvedValue(mockEpics);

      await epicService.getAll({ workspaceId: '1', status: 'open' });

      expect(mockPrismaClient.epic.findMany).toHaveBeenCalledWith({
        where: { workspaceId: 1, status: 'open' },
        include: { priority: true, _count: { select: { tasks: true } } },
        orderBy: { id: 'desc' },
      });
    });
  });

  describe('getById', () => {
    test('deve retornar épico por id com todas as relações', async () => {
      const mockEpic = {
        id: 1,
        key: 'ALPHA-E1',
        title: 'Epic 1',
        priority: { id: 1, name: 'High' },
        tasks: [],
      };
      mockPrismaClient.epic.findUnique.mockResolvedValue(mockEpic);

      const result = await epicService.getById(1);

      expect(mockPrismaClient.epic.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          priority: true,
          tasks: {
            include: {
              priority: true,
              typeTask: true,
              reporter: true,
              assignee: true,
              step: true,
              sprint: true,
              workspace: { select: { id: true, key: true } },
            },
            orderBy: { id: 'desc' },
          },
        },
      });
      expect(result).toEqual(mockEpic);
    });

    test('deve converter id string para número', async () => {
      mockPrismaClient.epic.findUnique.mockResolvedValue(null);

      await epicService.getById('123');

      expect(mockPrismaClient.epic.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 123 } })
      );
    });
  });

  describe('create', () => {
    test('deve criar épico com chave gerada', async () => {
      const mockWorkspace = { id: 1, key: 'ALPHA', nextEpicSeq: 1 };
      const mockCreatedEpic = {
        id: 1,
        key: 'ALPHA-E1',
        title: 'New Epic',
        workspaceId: 1,
      };

      mockPrismaClient.$transaction.mockImplementation(async (callback) => {
        const tx = {
          workspace: {
            findUnique: jest.fn().mockResolvedValue(mockWorkspace),
            update: jest.fn(),
          },
        };
        await callback(tx);
        return 'ALPHA-E1';
      });
      mockPrismaClient.epic.create.mockResolvedValue(mockCreatedEpic);

      const data = {
        workspaceId: 1,
        title: 'New Epic',
        description: 'Epic description',
      };

      const result = await epicService.create(data);

      expect(mockPrismaClient.epic.create).toHaveBeenCalledWith({
        data: {
          key: 'ALPHA-E1',
          title: 'New Epic',
          description: 'Epic description',
          status: 'open',
          startDate: null,
          targetDate: null,
          priorityId: null,
          workspaceId: 1,
        },
        include: { priority: true },
      });
      expect(result).toEqual(mockCreatedEpic);
    });

    test('deve criar épico com todos os campos opcionais', async () => {
      const mockWorkspace = { id: 1, key: 'ALPHA', nextEpicSeq: 2 };

      mockPrismaClient.$transaction.mockImplementation(async (callback) => {
        const tx = {
          workspace: {
            findUnique: jest.fn().mockResolvedValue(mockWorkspace),
            update: jest.fn(),
          },
        };
        await callback(tx);
        return 'ALPHA-E2';
      });
      mockPrismaClient.epic.create.mockResolvedValue({});

      const data = {
        workspaceId: 1,
        title: 'Epic',
        description: 'Description',
        status: 'in_progress',
        startDate: '2024-01-01',
        targetDate: '2024-02-01',
        priorityId: 3,
      };

      await epicService.create(data);

      expect(mockPrismaClient.epic.create).toHaveBeenCalledWith({
        data: {
          key: 'ALPHA-E2',
          title: 'Epic',
          description: 'Description',
          status: 'in_progress',
          startDate: new Date('2024-01-01'),
          targetDate: new Date('2024-02-01'),
          priorityId: 3,
          workspaceId: 1,
        },
        include: { priority: true },
      });
    });

    test('deve lançar erro se workspace não existir', async () => {
      mockPrismaClient.$transaction.mockImplementation(async (callback) => {
        const tx = {
          workspace: {
            findUnique: jest.fn().mockResolvedValue(null),
            update: jest.fn(),
          },
        };
        return callback(tx);
      });

      await expect(
        epicService.create({ workspaceId: 999, title: 'Epic' })
      ).rejects.toThrow('Workspace inválido');
    });
  });

  describe('update', () => {
    test('deve atualizar épico com dados fornecidos', async () => {
      const mockUpdated = {
        id: 1,
        title: 'Updated Epic',
        status: 'completed',
      };
      mockPrismaClient.epic.update.mockResolvedValue(mockUpdated);

      const result = await epicService.update(1, {
        title: 'Updated Epic',
        status: 'completed',
      });

      expect(mockPrismaClient.epic.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          title: 'Updated Epic',
          status: 'completed',
          description: undefined,
          startDate: undefined,
          targetDate: undefined,
          priorityId: undefined,
        },
        include: { priority: true },
      });
      expect(result).toEqual(mockUpdated);
    });

    
    test('deve permitir limpar datas e prioridade', async () => {
      mockPrismaClient.epic.update.mockResolvedValue({});

      await epicService.update(1, {
        startDate: null,
        targetDate: null,
        priorityId: null,
      });

      expect(mockPrismaClient.epic.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          title: undefined,
          description: undefined,
          status: undefined,
          startDate: undefined,
          targetDate: undefined,
          priorityId: undefined,
        },
        include: { priority: true },
      });
    });

    test('deve converter datas string para Date', async () => {
      mockPrismaClient.epic.update.mockResolvedValue({});

      await epicService.update(1, {
        startDate: '2024-01-01',
        targetDate: '2024-02-01',
      });

      expect(mockPrismaClient.epic.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            startDate: new Date('2024-01-01'),
            targetDate: new Date('2024-02-01'),
          }),
        })
      );
    });
  });

  describe('removeMany', () => {
    test('deve remover épicos sem tarefas', async () => {
      const mockEpics = [
        { id: 1, key: 'ALPHA-E1', _count: { tasks: 0 } },
        { id: 2, key: 'ALPHA-E2', _count: { tasks: 0 } },
      ];
      mockPrismaClient.epic.findMany.mockResolvedValue(mockEpics);
      mockPrismaClient.epic.deleteMany.mockResolvedValue({ count: 2 });

      const result = await epicService.removeMany([1, 2]);

      expect(mockPrismaClient.epic.findMany).toHaveBeenCalledWith({
        where: { id: { in: [1, 2] } },
        select: { id: true, key: true, _count: { select: { tasks: true } } },
      });
      expect(mockPrismaClient.epic.deleteMany).toHaveBeenCalledWith({
        where: { id: { in: [1, 2] } },
      });
      expect(result).toEqual({ count: 2 });
    });

    test('deve lançar erro se épico tiver tarefas associadas', async () => {
      const mockEpics = [
        { id: 1, key: 'ALPHA-E1', _count: { tasks: 5 } },
        { id: 2, key: 'ALPHA-E2', _count: { tasks: 0 } },
      ];
      mockPrismaClient.epic.findMany.mockResolvedValue(mockEpics);

      await expect(epicService.removeMany([1, 2])).rejects.toThrow(
        'Não é possível excluir: ALPHA-E1 possuem atividades associadas.'
      );
      expect(mockPrismaClient.epic.deleteMany).not.toHaveBeenCalled();
    });

    test('deve retornar count 0 se lista vazia', async () => {
      const result = await epicService.removeMany([]);
      expect(result).toEqual({ count: 0 });
      expect(mockPrismaClient.epic.findMany).not.toHaveBeenCalled();
    });

    test('deve retornar count 0 se ids for null', async () => {
      const result = await epicService.removeMany(null);
      expect(result).toEqual({ count: 0 });
    });

    test('deve converter ids string para número', async () => {
      mockPrismaClient.epic.findMany.mockResolvedValue([]);
      mockPrismaClient.epic.deleteMany.mockResolvedValue({ count: 0 });

      await epicService.removeMany(['1', '2', '3']);

      expect(mockPrismaClient.epic.findMany).toHaveBeenCalledWith({
        where: { id: { in: [1, 2, 3] } },
        select: { id: true, key: true, _count: { select: { tasks: true } } },
      });
    });

    test('erro deve ter statusCode 409', async () => {
      const mockEpics = [{ id: 1, key: 'ALPHA-E1', _count: { tasks: 3 } }];
      mockPrismaClient.epic.findMany.mockResolvedValue(mockEpics);

      try {
        await epicService.removeMany([1]);
        fail('Deveria lançar erro');
      } catch (error) {
        expect(error.statusCode).toBe(409);
      }
    });
  });
});