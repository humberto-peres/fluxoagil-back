const mockPrismaClient = {
  task: {
    findMany: jest.fn(),
  },
  sprint: {
    findFirst: jest.fn(),
  },
  epic: {
    findMany: jest.fn(),
  },
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrismaClient),
}));

const dashboardService = require('../../../src/services/dashboard.service');

describe('Dashboard Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock da data atual para testes consistentes
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-06-15T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('getDashboardData', () => {
    test('deve retornar dados completos do dashboard', async () => {
      const mockTasks = [
        {
          id: 1,
          idTask: 'TASK-1',
          title: 'Task 1',
          workspaceId: 1,
          assigneeId: 1,
          deadline: new Date('2024-06-20'),
          updatedAt: new Date('2024-06-15'),
          step: { name: 'To Do' },
          priority: { name: 'High', label: 'Alta' },
          typeTask: { name: 'Bug' },
          assignee: { id: 1, name: 'User 1' },
          reporter: { id: 2, name: 'User 2' },
          sprint: { id: 1, name: 'Sprint 1' },
          epic: { id: 1, key: 'EPIC-1', title: 'Epic 1' },
        },
        {
          id: 2,
          idTask: 'TASK-2',
          title: 'Task 2',
          workspaceId: 1,
          assigneeId: 2,
          deadline: new Date('2024-06-10'),
          updatedAt: new Date('2024-06-14'),
          step: { name: 'In Progress' },
          priority: { name: 'Low', label: 'Baixa' },
          typeTask: { name: 'Feature' },
          assignee: { id: 2, name: 'User 2' },
          reporter: { id: 1, name: 'User 1' },
          sprint: null,
          epic: null,
        },
      ];

      const mockSprint = {
        id: 1,
        name: 'Sprint 1',
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-06-30'),
        activatedAt: new Date('2024-06-01'),
      };

      const mockEpics = [
        {
          id: 1,
          key: 'EPIC-1',
          title: 'Epic 1',
          _count: { tasks: 2 },
          tasks: [
            { step: { name: 'Done' } },
            { step: { name: 'To Do' } },
          ],
        },
      ];

      mockPrismaClient.task.findMany.mockResolvedValue(mockTasks);
      mockPrismaClient.sprint.findFirst.mockResolvedValue(mockSprint);
      mockPrismaClient.epic.findMany.mockResolvedValue(mockEpics);

      const result = await dashboardService.getDashboardData(1, 1);

      expect(result).toHaveProperty('totalTasks', 2);
      expect(result).toHaveProperty('completedTasks', 0);
      expect(result).toHaveProperty('overdueTasks', 1);
      expect(result).toHaveProperty('upcomingTasks', 1);
      expect(result).toHaveProperty('activeSprint');
      expect(result).toHaveProperty('myTasks');
      expect(result).toHaveProperty('tasksByStatus');
      expect(result).toHaveProperty('tasksByPriority');
      expect(result).toHaveProperty('tasksByType');
      expect(result).toHaveProperty('epicProgress');
      expect(result).toHaveProperty('recentActivity');
    });

    test('deve buscar tasks com workspaceId correto', async () => {
      mockPrismaClient.task.findMany.mockResolvedValue([]);
      mockPrismaClient.sprint.findFirst.mockResolvedValue(null);
      mockPrismaClient.epic.findMany.mockResolvedValue([]);

      await dashboardService.getDashboardData(42, 1);

      expect(mockPrismaClient.task.findMany).toHaveBeenCalledWith({
        where: { workspaceId: 42 },
        include: {
          priority: true,
          typeTask: true,
          step: true,
          assignee: { select: { id: true, name: true } },
          reporter: { select: { id: true, name: true } },
          sprint: { select: { id: true, name: true } },
          epic: { select: { id: true, key: true, title: true } },
        },
        orderBy: { updatedAt: 'desc' },
      });
    });

    test('deve buscar sprint ativa do workspace', async () => {
      mockPrismaClient.task.findMany.mockResolvedValue([]);
      mockPrismaClient.sprint.findFirst.mockResolvedValue(null);
      mockPrismaClient.epic.findMany.mockResolvedValue([]);

      await dashboardService.getDashboardData(1, 1);

      expect(mockPrismaClient.sprint.findFirst).toHaveBeenCalledWith({
        where: { workspaceId: 1, isActive: true },
        select: {
          id: true,
          name: true,
          startDate: true,
          endDate: true,
          activatedAt: true,
        },
      });
    });

    test('deve buscar épicos do workspace com tasks', async () => {
      mockPrismaClient.task.findMany.mockResolvedValue([]);
      mockPrismaClient.sprint.findFirst.mockResolvedValue(null);
      mockPrismaClient.epic.findMany.mockResolvedValue([]);

      await dashboardService.getDashboardData(1, 1);

      expect(mockPrismaClient.epic.findMany).toHaveBeenCalledWith({
        where: { workspaceId: 1 },
        include: {
          _count: { select: { tasks: true } },
          tasks: {
            include: { step: true },
          },
        },
        orderBy: { id: 'desc' },
        take: 10,
      });
    });

    test('deve calcular totalTasks corretamente', async () => {
      const mockTasks = [
        { id: 1, step: { name: 'To Do' }, assigneeId: 1, deadline: null, updatedAt: new Date() },
        { id: 2, step: { name: 'Done' }, assigneeId: 1, deadline: null, updatedAt: new Date() },
        { id: 3, step: { name: 'In Progress' }, assigneeId: 2, deadline: null, updatedAt: new Date() },
      ];

      mockPrismaClient.task.findMany.mockResolvedValue(mockTasks);
      mockPrismaClient.sprint.findFirst.mockResolvedValue(null);
      mockPrismaClient.epic.findMany.mockResolvedValue([]);

      const result = await dashboardService.getDashboardData(1, 1);

      expect(result.totalTasks).toBe(3);
    });

    test('deve calcular completedTasks identificando status done/feito/concluído', async () => {
      const mockTasks = [
        { id: 1, step: { name: 'Done' }, assigneeId: 1, deadline: null, updatedAt: new Date() },
        { id: 2, step: { name: 'Feito' }, assigneeId: 1, deadline: null, updatedAt: new Date() },
        { id: 3, step: { name: 'Concluído' }, assigneeId: 1, deadline: null, updatedAt: new Date() },
        { id: 4, step: { name: 'Concluido' }, assigneeId: 1, deadline: null, updatedAt: new Date() },
        { id: 5, step: { name: 'To Do' }, assigneeId: 1, deadline: null, updatedAt: new Date() },
      ];

      mockPrismaClient.task.findMany.mockResolvedValue(mockTasks);
      mockPrismaClient.sprint.findFirst.mockResolvedValue(null);
      mockPrismaClient.epic.findMany.mockResolvedValue([]);

      const result = await dashboardService.getDashboardData(1, 1);

      expect(result.completedTasks).toBe(4);
    });

    test('deve calcular overdueTasks corretamente', async () => {
      const mockTasks = [
        { 
          id: 1, 
          step: { name: 'To Do' }, 
          assigneeId: 1, 
          deadline: new Date('2024-06-10'), 
          updatedAt: new Date() 
        },
        { 
          id: 2, 
          step: { name: 'In Progress' }, 
          assigneeId: 1, 
          deadline: new Date('2024-06-14'), 
          updatedAt: new Date() 
        },
        { 
          id: 3, 
          step: { name: 'Done' }, 
          assigneeId: 1, 
          deadline: new Date('2024-06-10'), 
          updatedAt: new Date() 
        },
        { 
          id: 4, 
          step: { name: 'To Do' }, 
          assigneeId: 1, 
          deadline: new Date('2024-06-20'), 
          updatedAt: new Date() 
        },
      ];

      mockPrismaClient.task.findMany.mockResolvedValue(mockTasks);
      mockPrismaClient.sprint.findFirst.mockResolvedValue(null);
      mockPrismaClient.epic.findMany.mockResolvedValue([]);

      const result = await dashboardService.getDashboardData(1, 1);

      expect(result.overdueTasks).toBe(2);
    });

    test('deve calcular upcomingTasks (próximos 7 dias)', async () => {
      const mockTasks = [
        { 
          id: 1, 
          step: { name: 'To Do' }, 
          assigneeId: 1, 
          deadline: new Date('2024-06-16'), // 1 dia
          updatedAt: new Date() 
        },
        { 
          id: 2, 
          step: { name: 'To Do' }, 
          assigneeId: 1, 
          deadline: new Date('2024-06-22'), // 7 dias
          updatedAt: new Date() 
        },
        { 
          id: 3, 
          step: { name: 'To Do' }, 
          assigneeId: 1, 
          deadline: new Date('2024-06-25'), // 10 dias - fora
          updatedAt: new Date() 
        },
        { 
          id: 4, 
          step: { name: 'Done' }, 
          assigneeId: 1, 
          deadline: new Date('2024-06-16'), // concluída
          updatedAt: new Date() 
        },
      ];

      mockPrismaClient.task.findMany.mockResolvedValue(mockTasks);
      mockPrismaClient.sprint.findFirst.mockResolvedValue(null);
      mockPrismaClient.epic.findMany.mockResolvedValue([]);

      const result = await dashboardService.getDashboardData(1, 1);

      expect(result.upcomingTasks).toBe(2);
    });

    test('deve retornar myTasks filtradas por userId', async () => {
      const mockTasks = [
        {
          id: 1,
          idTask: 'TASK-1',
          title: 'My Task 1',
          step: { name: 'To Do' },
          priority: { name: 'High', label: 'Alta' },
          assigneeId: 5,
          deadline: new Date('2024-06-20'),
          epic: { key: 'EPIC-1' },
          updatedAt: new Date(),
        },
        {
          id: 2,
          idTask: 'TASK-2',
          title: 'Other Task',
          step: { name: 'To Do' },
          priority: null,
          assigneeId: 10,
          deadline: null,
          epic: null,
          updatedAt: new Date(),
        },
      ];

      mockPrismaClient.task.findMany.mockResolvedValue(mockTasks);
      mockPrismaClient.sprint.findFirst.mockResolvedValue(null);
      mockPrismaClient.epic.findMany.mockResolvedValue([]);

      const result = await dashboardService.getDashboardData(1, 5);

      expect(result.myTasks).toHaveLength(1);
      expect(result.myTasks[0]).toEqual({
        id: 1,
        idTask: 'TASK-1',
        title: 'My Task 1',
        status: 'To Do',
        priority: { name: 'High', label: 'Alta' },
        deadline: new Date('2024-06-20'),
        epicKey: 'EPIC-1',
      });
    });

    test('deve ordenar myTasks por deadline', async () => {
      const mockTasks = [
        {
          id: 1,
          idTask: 'TASK-1',
          title: 'Task 1',
          step: { name: 'To Do' },
          priority: null,
          assigneeId: 1,
          deadline: new Date('2024-06-25'),
          epic: null,
          updatedAt: new Date(),
        },
        {
          id: 2,
          idTask: 'TASK-2',
          title: 'Task 2',
          step: { name: 'To Do' },
          priority: null,
          assigneeId: 1,
          deadline: new Date('2024-06-20'),
          epic: null,
          updatedAt: new Date(),
        },
        {
          id: 3,
          idTask: 'TASK-3',
          title: 'Task 3',
          step: { name: 'To Do' },
          priority: null,
          assigneeId: 1,
          deadline: null,
          epic: null,
          updatedAt: new Date(),
        },
      ];

      mockPrismaClient.task.findMany.mockResolvedValue(mockTasks);
      mockPrismaClient.sprint.findFirst.mockResolvedValue(null);
      mockPrismaClient.epic.findMany.mockResolvedValue([]);

      const result = await dashboardService.getDashboardData(1, 1);

      expect(result.myTasks[0].idTask).toBe('TASK-2');
      expect(result.myTasks[1].idTask).toBe('TASK-1');
      expect(result.myTasks[2].idTask).toBe('TASK-3');
    });

    test('deve limitar myTasks a 10 itens', async () => {
      const mockTasks = Array.from({ length: 15 }, (_, i) => ({
        id: i + 1,
        idTask: `TASK-${i + 1}`,
        title: `Task ${i + 1}`,
        step: { name: 'To Do' },
        priority: null,
        assigneeId: 1,
        deadline: null,
        epic: null,
        updatedAt: new Date(),
      }));

      mockPrismaClient.task.findMany.mockResolvedValue(mockTasks);
      mockPrismaClient.sprint.findFirst.mockResolvedValue(null);
      mockPrismaClient.epic.findMany.mockResolvedValue([]);

      const result = await dashboardService.getDashboardData(1, 1);

      expect(result.myTasks).toHaveLength(10);
    });

    test('deve agrupar tasksByStatus corretamente', async () => {
      const mockTasks = [
        { id: 1, step: { name: 'To Do' }, assigneeId: 1, deadline: null, updatedAt: new Date() },
        { id: 2, step: { name: 'To Do' }, assigneeId: 1, deadline: null, updatedAt: new Date() },
        { id: 3, step: { name: 'Done' }, assigneeId: 1, deadline: null, updatedAt: new Date() },
        { id: 4, step: { name: 'In Progress' }, assigneeId: 1, deadline: null, updatedAt: new Date() },
        { id: 5, step: { name: 'To Do' }, assigneeId: 1, deadline: null, updatedAt: new Date() },
      ];

      mockPrismaClient.task.findMany.mockResolvedValue(mockTasks);
      mockPrismaClient.sprint.findFirst.mockResolvedValue(null);
      mockPrismaClient.epic.findMany.mockResolvedValue([]);

      const result = await dashboardService.getDashboardData(1, 1);

      expect(result.tasksByStatus).toEqual([
        { name: 'To Do', count: 3 },
        { name: 'Done', count: 1 },
        { name: 'In Progress', count: 1 },
      ]);
    });

    test('deve agrupar tasksByPriority corretamente', async () => {
      const mockTasks = [
        { 
          id: 1, 
          step: { name: 'To Do' }, 
          priority: { name: 'High', label: 'Alta' }, 
          assigneeId: 1, 
          deadline: null, 
          updatedAt: new Date() 
        },
        { 
          id: 2, 
          step: { name: 'To Do' }, 
          priority: { name: 'High', label: 'Alta' }, 
          assigneeId: 1, 
          deadline: null, 
          updatedAt: new Date() 
        },
        { 
          id: 3, 
          step: { name: 'To Do' }, 
          priority: { name: 'Low', label: 'Baixa' }, 
          assigneeId: 1, 
          deadline: null, 
          updatedAt: new Date() 
        },
        { 
          id: 4, 
          step: { name: 'To Do' }, 
          priority: null, 
          assigneeId: 1, 
          deadline: null, 
          updatedAt: new Date() 
        },
      ];

      mockPrismaClient.task.findMany.mockResolvedValue(mockTasks);
      mockPrismaClient.sprint.findFirst.mockResolvedValue(null);
      mockPrismaClient.epic.findMany.mockResolvedValue([]);

      const result = await dashboardService.getDashboardData(1, 1);

      expect(result.tasksByPriority).toEqual([
        { name: 'High', label: 'Alta', count: 2 },
        { name: 'Low', label: 'Baixa', count: 1 },
        { name: 'Sem prioridade', label: undefined, count: 1 },
      ]);
    });

    test('deve agrupar tasksByType corretamente', async () => {
      const mockTasks = [
        { 
          id: 1, 
          step: { name: 'To Do' }, 
          typeTask: { name: 'Bug' }, 
          assigneeId: 1, 
          deadline: null, 
          updatedAt: new Date() 
        },
        { 
          id: 2, 
          step: { name: 'To Do' }, 
          typeTask: { name: 'Feature' }, 
          assigneeId: 1, 
          deadline: null, 
          updatedAt: new Date() 
        },
        { 
          id: 3, 
          step: { name: 'To Do' }, 
          typeTask: { name: 'Bug' }, 
          assigneeId: 1, 
          deadline: null, 
          updatedAt: new Date() 
        },
        { 
          id: 4, 
          step: { name: 'To Do' }, 
          typeTask: null, 
          assigneeId: 1, 
          deadline: null, 
          updatedAt: new Date() 
        },
      ];

      mockPrismaClient.task.findMany.mockResolvedValue(mockTasks);
      mockPrismaClient.sprint.findFirst.mockResolvedValue(null);
      mockPrismaClient.epic.findMany.mockResolvedValue([]);

      const result = await dashboardService.getDashboardData(1, 1);

      expect(result.tasksByType).toEqual([
        { name: 'Bug', count: 2 },
        { name: 'Feature', count: 1 },
        { name: 'Sem tipo', count: 1 },
      ]);
    });

    test('deve calcular epicProgress corretamente', async () => {
      const mockEpics = [
        {
          id: 1,
          key: 'EPIC-1',
          title: 'Epic 1',
          _count: { tasks: 4 },
          tasks: [
            { step: { name: 'Done' } },
            { step: { name: 'Done' } },
            { step: { name: 'To Do' } },
            { step: { name: 'In Progress' } },
          ],
        },
        {
          id: 2,
          key: 'EPIC-2',
          title: 'Epic 2',
          _count: { tasks: 2 },
          tasks: [
            { step: { name: 'Concluído' } },
            { step: { name: 'Concluído' } },
          ],
        },
        {
          id: 3,
          key: 'EPIC-3',
          title: 'Epic 3',
          _count: { tasks: 0 },
          tasks: [],
        },
      ];

      mockPrismaClient.task.findMany.mockResolvedValue([]);
      mockPrismaClient.sprint.findFirst.mockResolvedValue(null);
      mockPrismaClient.epic.findMany.mockResolvedValue(mockEpics);

      const result = await dashboardService.getDashboardData(1, 1);

      expect(result.epicProgress).toEqual([
        { id: 2, key: 'EPIC-2', title: 'Epic 2', total: 2, done: 2, pct: 100 },
        { id: 1, key: 'EPIC-1', title: 'Epic 1', total: 4, done: 2, pct: 50 },
        { id: 3, key: 'EPIC-3', title: 'Epic 3', total: 0, done: 0, pct: 0 },
      ]);
    });

    test('deve retornar recentActivity com últimas 10 tasks', async () => {
      const mockTasks = Array.from({ length: 15 }, (_, i) => ({
        id: i + 1,
        idTask: `TASK-${i + 1}`,
        title: `Task ${i + 1}`,
        step: { name: 'To Do' },
        assignee: { name: `User ${i + 1}` },
        assigneeId: 1,
        deadline: null,
        updatedAt: new Date(`2024-06-${15 - i}`),
      }));

      mockPrismaClient.task.findMany.mockResolvedValue(mockTasks);
      mockPrismaClient.sprint.findFirst.mockResolvedValue(null);
      mockPrismaClient.epic.findMany.mockResolvedValue([]);

      const result = await dashboardService.getDashboardData(1, 1);

      expect(result.recentActivity).toHaveLength(10);
      expect(result.recentActivity[0]).toEqual({
        id: 1,
        idTask: 'TASK-1',
        title: 'Task 1',
        status: 'To Do',
        assignee: 'User 1',
        updatedAt: new Date('2024-06-15'),
      });
    });

    test('deve retornar activeSprint quando existir', async () => {
      const mockSprint = {
        id: 1,
        name: 'Sprint 1',
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-06-30'),
        activatedAt: new Date('2024-06-01'),
      };

      mockPrismaClient.task.findMany.mockResolvedValue([]);
      mockPrismaClient.sprint.findFirst.mockResolvedValue(mockSprint);
      mockPrismaClient.epic.findMany.mockResolvedValue([]);

      const result = await dashboardService.getDashboardData(1, 1);

      expect(result.activeSprint).toEqual(mockSprint);
    });

    test('deve retornar activeSprint null quando não existir', async () => {
      mockPrismaClient.task.findMany.mockResolvedValue([]);
      mockPrismaClient.sprint.findFirst.mockResolvedValue(null);
      mockPrismaClient.epic.findMany.mockResolvedValue([]);

      const result = await dashboardService.getDashboardData(1, 1);

      expect(result.activeSprint).toBeNull();
    });

    test('deve lidar com tasks sem assignee', async () => {
      const mockTasks = [
        {
          id: 1,
          idTask: 'TASK-1',
          title: 'Task 1',
          step: { name: 'To Do' },
          assignee: null,
          assigneeId: null,
          deadline: null,
          updatedAt: new Date(),
        },
      ];

      mockPrismaClient.task.findMany.mockResolvedValue(mockTasks);
      mockPrismaClient.sprint.findFirst.mockResolvedValue(null);
      mockPrismaClient.epic.findMany.mockResolvedValue([]);

      const result = await dashboardService.getDashboardData(1, 1);

      expect(result.recentActivity[0].assignee).toBeUndefined();
    });

    test('deve lidar com workspace sem tasks', async () => {
      mockPrismaClient.task.findMany.mockResolvedValue([]);
      mockPrismaClient.sprint.findFirst.mockResolvedValue(null);
      mockPrismaClient.epic.findMany.mockResolvedValue([]);

      const result = await dashboardService.getDashboardData(1, 1);

      expect(result.totalTasks).toBe(0);
      expect(result.completedTasks).toBe(0);
      expect(result.overdueTasks).toBe(0);
      expect(result.upcomingTasks).toBe(0);
      expect(result.myTasks).toEqual([]);
      expect(result.tasksByStatus).toEqual([]);
      expect(result.tasksByPriority).toEqual([]);
      expect(result.tasksByType).toEqual([]);
      expect(result.recentActivity).toEqual([]);
    });
  });
});