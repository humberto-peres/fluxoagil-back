const mockPrismaClient = {
  step: {
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

const stepService = require('../../../src/services/step.service');

describe('Step Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    test('deve retornar todas as etapas', async () => {
      const mockSteps = [
        { id: 1, name: 'Análise', order: 1 },
        { id: 2, name: 'Desenvolvimento', order: 2 },
        { id: 3, name: 'Testes', order: 3 },
      ];
      mockPrismaClient.step.findMany.mockResolvedValue(mockSteps);

      const result = await stepService.getAll();

      expect(mockPrismaClient.step.findMany).toHaveBeenCalledWith();
      expect(result).toEqual(mockSteps);
      expect(result).toHaveLength(3);
    });

    test('deve retornar array vazio quando não houver etapas', async () => {
      mockPrismaClient.step.findMany.mockResolvedValue([]);

      const result = await stepService.getAll();

      expect(result).toEqual([]);
    });
  });

  describe('getById', () => {
    test('deve retornar etapa por id', async () => {
      const mockStep = { id: 1, name: 'Análise', order: 1 };
      mockPrismaClient.step.findUnique.mockResolvedValue(mockStep);

      const result = await stepService.getById(1);

      expect(mockPrismaClient.step.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(mockStep);
    });

    test('deve retornar null quando etapa não existir', async () => {
      mockPrismaClient.step.findUnique.mockResolvedValue(null);

      const result = await stepService.getById(999);

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    test('deve criar etapa com sucesso', async () => {
      const newStep = { name: 'Deploy', order: 4 };
      const createdStep = { id: 4, ...newStep };
      mockPrismaClient.step.create.mockResolvedValue(createdStep);

      const result = await stepService.create(newStep);

      expect(mockPrismaClient.step.create).toHaveBeenCalledWith({
        data: newStep,
      });
      expect(result).toEqual(createdStep);
    });

    test('deve criar etapa com todos os campos', async () => {
      const newStep = {
        name: 'Homologação',
        order: 5,
        description: 'Fase de testes',
      };
      mockPrismaClient.step.create.mockResolvedValue({ id: 5, ...newStep });

      await stepService.create(newStep);

      expect(mockPrismaClient.step.create).toHaveBeenCalledWith({
        data: newStep,
      });
    });
  });

  describe('update', () => {
    test('deve atualizar etapa com sucesso', async () => {
      const updateData = { name: 'Análise Detalhada', order: 1 };
      const updatedStep = { id: 1, ...updateData };
      mockPrismaClient.step.update.mockResolvedValue(updatedStep);

      const result = await stepService.update(1, updateData);

      expect(mockPrismaClient.step.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateData,
      });
      expect(result).toEqual(updatedStep);
    });

    test('deve atualizar apenas campos fornecidos', async () => {
      const updateData = { name: 'Nome Atualizado' };
      mockPrismaClient.step.update.mockResolvedValue({});

      await stepService.update(1, updateData);

      expect(mockPrismaClient.step.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateData,
      });
    });

    test('deve atualizar campo order', async () => {
      const updateData = { order: 10 };
      mockPrismaClient.step.update.mockResolvedValue({});

      await stepService.update(1, updateData);

      expect(mockPrismaClient.step.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { order: 10 },
      });
    });
  });

  describe('removeMany', () => {
    test('deve remover múltiplas etapas', async () => {
      const idsToRemove = [1, 2, 3];
      mockPrismaClient.step.deleteMany.mockResolvedValue({ count: 3 });

      const result = await stepService.removeMany(idsToRemove);

      expect(mockPrismaClient.step.deleteMany).toHaveBeenCalledWith({
        where: { id: { in: idsToRemove } },
      });
      expect(result).toEqual({ count: 3 });
    });

    test('deve remover uma única etapa', async () => {
      const idsToRemove = [1];
      mockPrismaClient.step.deleteMany.mockResolvedValue({ count: 1 });

      await stepService.removeMany(idsToRemove);

      expect(mockPrismaClient.step.deleteMany).toHaveBeenCalledWith({
        where: { id: { in: [1] } },
      });
    });

    test('deve funcionar com array vazio', async () => {
      mockPrismaClient.step.deleteMany.mockResolvedValue({ count: 0 });

      const result = await stepService.removeMany([]);

      expect(mockPrismaClient.step.deleteMany).toHaveBeenCalledWith({
        where: { id: { in: [] } },
      });
      expect(result.count).toBe(0);
    });

    test('deve retornar count de registros removidos', async () => {
      mockPrismaClient.step.deleteMany.mockResolvedValue({ count: 5 });

      const result = await stepService.removeMany([1, 2, 3, 4, 5]);

      expect(result.count).toBe(5);
    });
  });
});