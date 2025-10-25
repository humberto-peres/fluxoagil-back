const mockPrismaClient = {
  typeTask: {
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

const typeTaskService = require('../../../src/services/typeTask.service');

describe('TypeTask Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    test('deve retornar todos os tipos de atividade', async () => {
      const mockTypes = [
        { id: 1, name: 'Bug', icon: '🐛' },
        { id: 2, name: 'Feature', icon: '✨' },
        { id: 3, name: 'Task', icon: '📋' },
      ];
      mockPrismaClient.typeTask.findMany.mockResolvedValue(mockTypes);

      const result = await typeTaskService.getAll();

      expect(mockPrismaClient.typeTask.findMany).toHaveBeenCalledWith();
      expect(result).toEqual(mockTypes);
      expect(result).toHaveLength(3);
    });

    test('deve retornar array vazio quando não houver tipos', async () => {
      mockPrismaClient.typeTask.findMany.mockResolvedValue([]);

      const result = await typeTaskService.getAll();

      expect(result).toEqual([]);
    });
  });

  describe('getById', () => {
    test('deve retornar tipo de atividade por id', async () => {
      const mockType = { id: 1, name: 'Bug', icon: '🐛' };
      mockPrismaClient.typeTask.findUnique.mockResolvedValue(mockType);

      const result = await typeTaskService.getById(1);

      expect(mockPrismaClient.typeTask.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(mockType);
    });

    test('deve retornar null quando tipo não existir', async () => {
      mockPrismaClient.typeTask.findUnique.mockResolvedValue(null);

      const result = await typeTaskService.getById(999);

      expect(result).toBeNull();
    });

    test('deve converter id para número', async () => {
      mockPrismaClient.typeTask.findUnique.mockResolvedValue({});

      await typeTaskService.getById(5);

      expect(mockPrismaClient.typeTask.findUnique).toHaveBeenCalledWith({
        where: { id: 5 },
      });
    });
  });

  describe('create', () => {
    test('deve criar tipo de atividade com sucesso', async () => {
      const newType = { name: 'Documentation', icon: '📚' };
      const createdType = { id: 4, ...newType };
      mockPrismaClient.typeTask.create.mockResolvedValue(createdType);

      const result = await typeTaskService.create(newType);

      expect(mockPrismaClient.typeTask.create).toHaveBeenCalledWith({
        data: newType,
      });
      expect(result).toEqual(createdType);
    });

    test('deve criar tipo com todos os campos', async () => {
      const newType = {
        name: 'Improvement',
        icon: '⚡',
        description: 'Performance improvement',
      };
      mockPrismaClient.typeTask.create.mockResolvedValue({ id: 5, ...newType });

      await typeTaskService.create(newType);

      expect(mockPrismaClient.typeTask.create).toHaveBeenCalledWith({
        data: newType,
      });
    });
  });

  describe('update', () => {
    test('deve atualizar tipo de atividade com sucesso', async () => {
      const updateData = { name: 'Critical Bug', icon: '🔥' };
      const updatedType = { id: 1, ...updateData };
      mockPrismaClient.typeTask.update.mockResolvedValue(updatedType);

      const result = await typeTaskService.update(1, updateData);

      expect(mockPrismaClient.typeTask.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateData,
      });
      expect(result).toEqual(updatedType);
    });

    test('deve atualizar apenas campos fornecidos', async () => {
      const updateData = { name: 'Updated Name' };
      mockPrismaClient.typeTask.update.mockResolvedValue({});

      await typeTaskService.update(1, updateData);

      expect(mockPrismaClient.typeTask.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateData,
      });
    });

    test('deve converter id para número', async () => {
      mockPrismaClient.typeTask.update.mockResolvedValue({});

      await typeTaskService.update(10, { name: 'Test' });

      expect(mockPrismaClient.typeTask.update).toHaveBeenCalledWith({
        where: { id: 10 },
        data: { name: 'Test' },
      });
    });
  });

  describe('deleteMany', () => {
    test('deve remover múltiplos tipos de atividade', async () => {
      const idsToRemove = [1, 2, 3];
      mockPrismaClient.typeTask.deleteMany.mockResolvedValue({ count: 3 });

      const result = await typeTaskService.deleteMany(idsToRemove);

      expect(mockPrismaClient.typeTask.deleteMany).toHaveBeenCalledWith({
        where: { id: { in: idsToRemove } },
      });
      expect(result).toEqual({ count: 3 });
    });

    test('deve remover um único tipo', async () => {
      const idsToRemove = [1];
      mockPrismaClient.typeTask.deleteMany.mockResolvedValue({ count: 1 });

      await typeTaskService.deleteMany(idsToRemove);

      expect(mockPrismaClient.typeTask.deleteMany).toHaveBeenCalledWith({
        where: { id: { in: [1] } },
      });
    });

    test('deve funcionar com array vazio', async () => {
      mockPrismaClient.typeTask.deleteMany.mockResolvedValue({ count: 0 });

      const result = await typeTaskService.deleteMany([]);

      expect(mockPrismaClient.typeTask.deleteMany).toHaveBeenCalledWith({
        where: { id: { in: [] } },
      });
      expect(result.count).toBe(0);
    });

    test('deve retornar count de registros removidos', async () => {
      mockPrismaClient.typeTask.deleteMany.mockResolvedValue({ count: 5 });

      const result = await typeTaskService.deleteMany([1, 2, 3, 4, 5]);

      expect(result.count).toBe(5);
    });
  });
});