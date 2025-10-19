const mockPrismaClient = {
  priority: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    deleteMany: jest.fn(),
  },
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrismaClient),
}));

const priorityService = require('../../../src/services/priority.service');

describe('Priority Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    test('deve retornar todas as prioridades', async () => {
      const mockPriorities = [
        { id: 1, label: 'Low', name: 'low', deleted: false },
        { id: 2, label: 'Medium', name: 'medium', deleted: false },
        { id: 3, label: 'High', name: 'high', deleted: false },
      ];
      mockPrismaClient.priority.findMany.mockResolvedValue(mockPriorities);

      const result = await priorityService.getAll();

      expect(mockPrismaClient.priority.findMany).toHaveBeenCalledWith();
      expect(result).toEqual(mockPriorities);
      expect(result).toHaveLength(3);
    });

    test('deve retornar array vazio quando não houver prioridades', async () => {
      mockPrismaClient.priority.findMany.mockResolvedValue([]);

      const result = await priorityService.getAll();

      expect(result).toEqual([]);
    });
  });

  describe('getById', () => {
    test('deve retornar prioridade por id', async () => {
      const mockPriority = { id: 1, label: 'High', name: 'high', deleted: false };
      mockPrismaClient.priority.findUnique.mockResolvedValue(mockPriority);

      const result = await priorityService.getById(1);

      expect(mockPrismaClient.priority.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(mockPriority);
    });

    test('deve retornar null quando prioridade não existir', async () => {
      mockPrismaClient.priority.findUnique.mockResolvedValue(null);

      const result = await priorityService.getById(999);

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    test('deve criar prioridade com sucesso', async () => {
      const newPriority = { label: 'Critical', name: 'critical' };
      const createdPriority = { id: 4, ...newPriority, deleted: false };
      mockPrismaClient.priority.create.mockResolvedValue(createdPriority);

      const result = await priorityService.create(newPriority);

      expect(mockPrismaClient.priority.create).toHaveBeenCalledWith({
        data: newPriority,
      });
      expect(result).toEqual(createdPriority);
    });

    test('deve criar prioridade com todos os campos', async () => {
      const newPriority = {
        label: 'Urgent',
        name: 'urgent',
        deleted: false,
      };
      mockPrismaClient.priority.create.mockResolvedValue({ id: 5, ...newPriority });

      await priorityService.create(newPriority);

      expect(mockPrismaClient.priority.create).toHaveBeenCalledWith({
        data: newPriority,
      });
    });
  });

  describe('update', () => {
    test('deve atualizar prioridade com sucesso', async () => {
      const updateData = { label: 'Very High', name: 'very_high' };
      const updatedPriority = { id: 1, ...updateData, deleted: false };
      mockPrismaClient.priority.update.mockResolvedValue(updatedPriority);

      const result = await priorityService.update(1, updateData);

      expect(mockPrismaClient.priority.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateData,
      });
      expect(result).toEqual(updatedPriority);
    });

    test('deve atualizar apenas campos fornecidos', async () => {
      const updateData = { label: 'Updated Label' };
      mockPrismaClient.priority.update.mockResolvedValue({});

      await priorityService.update(1, updateData);

      expect(mockPrismaClient.priority.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateData,
      });
    });

    test('deve atualizar campo deleted', async () => {
      const updateData = { deleted: true };
      mockPrismaClient.priority.update.mockResolvedValue({});

      await priorityService.update(1, updateData);

      expect(mockPrismaClient.priority.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { deleted: true },
      });
    });
  });

  describe('removeMany', () => {
    test('deve remover múltiplas prioridades', async () => {
      const idsToRemove = [1, 2, 3];
      mockPrismaClient.priority.deleteMany.mockResolvedValue({ count: 3 });

      const result = await priorityService.removeMany(idsToRemove);

      expect(mockPrismaClient.priority.deleteMany).toHaveBeenCalledWith({
        where: { id: { in: idsToRemove } },
      });
      expect(result).toEqual({ count: 3 });
    });

    test('deve remover uma única prioridade', async () => {
      const idsToRemove = [1];
      mockPrismaClient.priority.deleteMany.mockResolvedValue({ count: 1 });

      await priorityService.removeMany(idsToRemove);

      expect(mockPrismaClient.priority.deleteMany).toHaveBeenCalledWith({
        where: { id: { in: [1] } },
      });
    });

    test('deve funcionar com array vazio', async () => {
      mockPrismaClient.priority.deleteMany.mockResolvedValue({ count: 0 });

      const result = await priorityService.removeMany([]);

      expect(mockPrismaClient.priority.deleteMany).toHaveBeenCalledWith({
        where: { id: { in: [] } },
      });
      expect(result.count).toBe(0);
    });

    test('deve retornar count de registros removidos', async () => {
      mockPrismaClient.priority.deleteMany.mockResolvedValue({ count: 5 });

      const result = await priorityService.removeMany([1, 2, 3, 4, 5]);

      expect(result.count).toBe(5);
    });
  });
});