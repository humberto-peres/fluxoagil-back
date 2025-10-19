const mockPrismaClient = {
  task: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    deleteMany: jest.fn(),
  },
  workspace: {
    update: jest.fn(),
  },
  workspaceStep: {
    findFirst: jest.fn(),
  },
  sprint: {
    findUnique: jest.fn(),
  },
  epic: {
    findUnique: jest.fn(),
  },
  $transaction: jest.fn(),
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrismaClient),
}));

jest.mock('../../../src/utils/datetime', () => ({
  parseDateInput: jest.fn((date) => date ? new Date(date) : null),
}));

const taskService = require('../../../src/services/task.service');

describe('Task Service', () => {
  beforeEach(() => {
    mockPrismaClient.task.findUnique.mockResolvedValue({
      id: 1,
      stepId: 2,
      sprintId: 3,
      workspaceId: 1,
    });
    mockPrismaClient.workspaceStep.findFirst.mockResolvedValue({ id: 2, workspaceId: 1 });
    mockPrismaClient.sprint.findUnique.mockResolvedValue({ id: 3, workspaceId: 1 });
    mockPrismaClient.epic.findUnique.mockResolvedValue({ id: 5, workspaceId: 1 });
    mockPrismaClient.task.update.mockResolvedValue({ id: 1 });
  });

  describe('getAllTasks', () => {
    test('deve retornar todas as tarefas do usuário', async () => {
      const mockTasks = [
        { id: 1, title: 'Task 1', workspaceId: 1 },
        { id: 2, title: 'Task 2', workspaceId: 1 },
      ];
      mockPrismaClient.task.findMany.mockResolvedValue(mockTasks);

      const result = await taskService.getAllTasks(1);

      expect(mockPrismaClient.task.findMany).toHaveBeenCalledWith({
        where: {
          workspace: {
            team: {
              members: {
                some: { userId: 1 }
              }
            }
          }
        },
        include: expect.any(Object),
        orderBy: { id: 'asc' },
      });
      expect(result).toEqual(mockTasks);
    });

    test('deve retornar array vazio quando usuário não tem tarefas', async () => {
      mockPrismaClient.task.findMany.mockResolvedValue([]);

      const result = await taskService.getAllTasks(999);

      expect(result).toEqual([]);
    });
  });

  describe('getTasks', () => {
    test('deve retornar tarefas filtradas por workspaceId', async () => {
      const mockTasks = [{ id: 1, workspaceId: 5 }];
      mockPrismaClient.task.findMany.mockResolvedValue(mockTasks);

      const result = await taskService.getTasks({ workspaceId: 5 });

      expect(mockPrismaClient.task.findMany).toHaveBeenCalledWith({
        where: {
          workspaceId: 5,
          stepId: undefined,
          sprintId: undefined,
        },
        include: expect.any(Object),
        orderBy: { id: 'desc' },
      });
      expect(result).toEqual(mockTasks);
    });

    test('deve retornar tarefas filtradas por stepId', async () => {
      mockPrismaClient.task.findMany.mockResolvedValue([]);

      await taskService.getTasks({ stepId: 3 });

      expect(mockPrismaClient.task.findMany).toHaveBeenCalledWith({
        where: {
          workspaceId: undefined,
          stepId: 3,
          sprintId: undefined,
        },
        include: expect.any(Object),
        orderBy: { id: 'desc' },
      });
    });

    test('deve retornar tarefas sem sprint quando sprintId é null', async () => {
      mockPrismaClient.task.findMany.mockResolvedValue([]);

      await taskService.getTasks({ sprintId: null });

      expect(mockPrismaClient.task.findMany).toHaveBeenCalledWith({
        where: {
          workspaceId: undefined,
          stepId: undefined,
          sprintId: null,
        },
        include: expect.any(Object),
        orderBy: { id: 'desc' },
      });
    });

    test('deve retornar tarefas com múltiplos filtros', async () => {
      mockPrismaClient.task.findMany.mockResolvedValue([]);

      await taskService.getTasks({ workspaceId: 1, stepId: 2, sprintId: 3 });

      expect(mockPrismaClient.task.findMany).toHaveBeenCalledWith({
        where: {
          workspaceId: 1,
          stepId: 2,
          sprintId: 3,
        },
        include: expect.any(Object),
        orderBy: { id: 'desc' },
      });
    });
  });

  describe('getById', () => {
    test('deve retornar tarefa por id', async () => {
      const mockTask = { id: 1, title: 'Test Task', workspaceId: 1 };
      mockPrismaClient.task.findUnique.mockResolvedValue(mockTask);

      const result = await taskService.getById(1);

      expect(mockPrismaClient.task.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: expect.any(Object),
      });
      expect(result).toEqual(mockTask);
    });

    test('deve retornar null quando tarefa não existir', async () => {
      mockPrismaClient.task.findUnique.mockResolvedValue(null);

      const result = await taskService.getById(999);

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    beforeEach(() => {
      mockPrismaClient.workspaceStep.findFirst.mockResolvedValue({ id: 1 });
      mockPrismaClient.$transaction.mockImplementation(async (callback) => {
        return callback(mockPrismaClient);
      });
    });

    test('deve criar tarefa com sucesso', async () => {
      const newTask = {
        title: 'Nova Task',
        workspaceId: 1,
        stepId: 2,
        priorityId: 1,
        typeTaskId: 1,
        userId: 1,
      };

      mockPrismaClient.workspace.update.mockResolvedValue({
        nextTaskSeq: 10,
        key: 'PROJ',
      });
      mockPrismaClient.task.create.mockResolvedValue({ id: 5 });
      mockPrismaClient.task.findUnique.mockResolvedValue({
        id: 5,
        ...newTask,
        idTask: 'PROJ-10',
      });

      const result = await taskService.create(newTask);

      expect(mockPrismaClient.workspace.update).toHaveBeenCalled();
      expect(mockPrismaClient.task.create).toHaveBeenCalled();
      expect(result.idTask).toBe('PROJ-10');
    });

    test('deve lançar erro quando workspaceId não for fornecido', async () => {
      const newTask = { title: 'Task', stepId: 1 };

      await expect(taskService.create(newTask)).rejects.toThrow('workspaceId é obrigatório.');
    });

    test('deve validar se step pertence ao workspace', async () => {
      mockPrismaClient.workspaceStep.findFirst.mockResolvedValue(null);

      const newTask = {
        workspaceId: 1,
        stepId: 99,
        priorityId: 1,
        typeTaskId: 1,
        userId: 1,
      };

      await expect(taskService.create(newTask)).rejects.toThrow(
        'A etapa informada não pertence ao workspace.'
      );
    });

    test('deve validar sprint quando fornecida', async () => {
      mockPrismaClient.sprint.findUnique.mockResolvedValue(null);

      const newTask = {
        workspaceId: 1,
        stepId: 2,
        sprintId: 999,
        priorityId: 1,
        typeTaskId: 1,
        userId: 1,
      };

      await expect(taskService.create(newTask)).rejects.toThrow('Sprint inexistente.');
    });

    test('deve validar se sprint pertence ao workspace', async () => {
      mockPrismaClient.sprint.findUnique.mockResolvedValue({
        id: 5,
        workspaceId: 2,
      });

      const newTask = {
        workspaceId: 1,
        stepId: 2,
        sprintId: 5,
        priorityId: 1,
        typeTaskId: 1,
        userId: 1,
      };

      await expect(taskService.create(newTask)).rejects.toThrow(
        'workspaceId difere do workspace da sprint.'
      );
    });

    test('deve validar épico quando fornecido', async () => {
      mockPrismaClient.epic.findUnique.mockResolvedValue(null);

      const newTask = {
        workspaceId: 1,
        stepId: 2,
        epicId: 999,
        priorityId: 1,
        typeTaskId: 1,
        userId: 1,
      };

      await expect(taskService.create(newTask)).rejects.toThrow('Épico inexistente.');
    });

    test('deve validar se épico pertence ao workspace', async () => {
      mockPrismaClient.epic.findUnique.mockResolvedValue({
        id: 10,
        workspaceId: 2,
      });

      const newTask = {
        workspaceId: 1,
        stepId: 2,
        epicId: 10,
        priorityId: 1,
        typeTaskId: 1,
        userId: 1,
      };

      await expect(taskService.create(newTask)).rejects.toThrow(
        'O épico informado pertence a outro workspace.'
      );
    });
  });

  describe('update', () => {
    beforeEach(() => {
      mockPrismaClient.task.findUnique.mockResolvedValue({
        id: 1,
        stepId: 2,
        sprintId: 3,
        workspaceId: 1,
      });
      mockPrismaClient.workspaceStep.findFirst.mockResolvedValue({ id: 1 });
      mockPrismaClient.task.update.mockResolvedValue({ id: 1 });
    });

    test('deve atualizar tarefa com sucesso', async () => {
      const updateData = { title: 'Título atualizado' };

      await taskService.update(1, updateData);

      expect(mockPrismaClient.task.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: expect.objectContaining({ title: 'Título atualizado' }),
      });
    });

    test('deve lançar erro quando tarefa não existir', async () => {
      mockPrismaClient.task.findUnique.mockResolvedValue(null);

      await expect(taskService.update(999, { title: 'Test' })).rejects.toThrow(
        'Tarefa inexistente.'
      );
    });

    test('deve validar nova sprint quando fornecida', async () => {
      mockPrismaClient.sprint.findUnique.mockResolvedValue(null);

      await expect(taskService.update(1, { sprintId: 999 })).rejects.toThrow(
        'Sprint inexistente.'
      );
    });

    test('deve validar se nova sprint pertence ao workspace', async () => {
      mockPrismaClient.sprint.findUnique.mockResolvedValue({
        id: 5,
        workspaceId: 2,
      });

      await expect(taskService.update(1, { sprintId: 5 })).rejects.toThrow(
        'workspaceId difere do workspace da sprint.'
      );
    });

    test('deve permitir remover sprint (sprintId = null)', async () => {
      await taskService.update(1, { sprintId: null });

      expect(mockPrismaClient.task.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: expect.objectContaining({ sprintId: null }),
      });
    });

    test('deve validar novo step quando fornecido', async () => {
      mockPrismaClient.workspaceStep.findFirst.mockResolvedValue(null);

      await expect(taskService.update(1, { stepId: 999 })).rejects.toThrow(
        'A etapa informada não pertence ao workspace.'
      );
    });
  });

  describe('removeMany', () => {
    test('deve remover múltiplas tarefas', async () => {
      mockPrismaClient.task.findMany.mockResolvedValue([]);
      mockPrismaClient.task.deleteMany.mockResolvedValue({ count: 3 });

      const result = await taskService.removeMany([1, 2, 3]);

      expect(mockPrismaClient.task.deleteMany).toHaveBeenCalledWith({
        where: { id: { in: [1, 2, 3] } },
      });
      expect(result.count).toBe(3);
    });

    test('deve retornar count 0 para array vazio', async () => {
      const result = await taskService.removeMany([]);

      expect(result.count).toBe(0);
      expect(mockPrismaClient.task.deleteMany).not.toHaveBeenCalled();
    });

    test('deve lançar erro 409 quando tarefa estiver vinculada a épico', async () => {
      mockPrismaClient.task.findMany.mockResolvedValue([
        { id: 1, idTask: 'PROJ-1', epicId: 5 },
        { id: 2, idTask: 'PROJ-2', epicId: 5 },
      ]);

      await expect(taskService.removeMany([1, 2])).rejects.toMatchObject({
        message: expect.stringContaining('PROJ-1'),
        statusCode: 409,
      });
    });
  });

  describe('move', () => {
    test('deve mover tarefa para novo step', async () => {
      mockPrismaClient.task.findUnique.mockResolvedValue({
        id: 1,
        workspaceId: 1,
      });
      mockPrismaClient.workspaceStep.findFirst.mockResolvedValue({ id: 1 });
      mockPrismaClient.task.update.mockResolvedValue({
        id: 1,
        stepId: 5,
        status: '5',
      });

      const result = await taskService.move(1, 5);

      expect(mockPrismaClient.task.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { stepId: 5, status: '5' },
      });
      expect(result.stepId).toBe(5);
    });

    test('deve lançar erro quando tarefa não existir', async () => {
      mockPrismaClient.task.findUnique.mockResolvedValue(null);

      await expect(taskService.move(999, 5)).rejects.toThrow('Tarefa inexistente.');
    });

    test('deve validar se step pertence ao workspace', async () => {
      mockPrismaClient.task.findUnique.mockResolvedValue({
        id: 1,
        workspaceId: 1,
      });
      mockPrismaClient.workspaceStep.findFirst.mockResolvedValue(null);

      await expect(taskService.move(1, 999)).rejects.toThrow(
        'A etapa informada não pertence ao workspace.'
      );
    });
  });
});