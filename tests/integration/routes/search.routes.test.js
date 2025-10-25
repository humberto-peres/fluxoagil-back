const request = require('supertest');
const express = require('express');

const mockPrismaClient = {
  task: {
    findMany: jest.fn(),
  },
  epic: {
    findMany: jest.fn(),
  },
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrismaClient),
}));

const searchRoutes = require('../../../src/routes/search.routes');

describe('Search Routes', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/', searchRoutes);
    jest.clearAllMocks();

    mockPrismaClient.task.findMany.mockResolvedValue([]);
    mockPrismaClient.epic.findMany.mockResolvedValue([]);
  });

  describe('GET /search', () => {
    test('deve retornar array vazio para query muito curta', async () => {
      const response = await request(app)
        .get('/search')
        .query({ q: 'a' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ results: [] });
      expect(mockPrismaClient.task.findMany).not.toHaveBeenCalled();
      expect(mockPrismaClient.epic.findMany).not.toHaveBeenCalled();
    });

    test('deve retornar array vazio para query vazia', async () => {
      const response = await request(app)
        .get('/search')
        .query({ q: '' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ results: [] });
      expect(mockPrismaClient.task.findMany).not.toHaveBeenCalled();
      expect(mockPrismaClient.epic.findMany).not.toHaveBeenCalled();
    });

    test('deve retornar array vazio sem query param', async () => {
      const response = await request(app).get('/search');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ results: [] });
      expect(mockPrismaClient.task.findMany).not.toHaveBeenCalled();
      expect(mockPrismaClient.epic.findMany).not.toHaveBeenCalled();
    });

    test('deve buscar tasks e epics por padrão', async () => {
      mockPrismaClient.task.findMany.mockResolvedValue([
        { id: 1, title: 'Task 1', idTask: 'PROJ-1', status: 'todo', sprintId: 1 },
      ]);
      mockPrismaClient.epic.findMany.mockResolvedValue([
        { id: 1, title: 'Epic 1', key: 'EPIC-1' },
      ]);

      const response = await request(app)
        .get('/search')
        .query({ q: 'test' });

      expect(response.status).toBe(200);
      expect(mockPrismaClient.task.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { title: { contains: 'test', mode: 'insensitive' } },
            { idTask: { contains: 'test', mode: 'insensitive' } },
          ],
        },
        select: { id: true, title: true, status: true, sprintId: true, idTask: true },
        take: 10,
      });
      expect(mockPrismaClient.epic.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { title: { contains: 'test', mode: 'insensitive' } },
            { key: { contains: 'test', mode: 'insensitive' } },
          ],
        },
        select: { id: true, title: true, key: true },
        take: 10,
      });
    });

    test('deve formatar resultados de tasks corretamente', async () => {
      mockPrismaClient.task.findMany.mockResolvedValue([
        { id: 1, title: 'Task 1', idTask: 'PROJ-1', status: 'todo', sprintId: 1 },
        { id: 2, title: 'Task 2', idTask: 'PROJ-2', status: 'done', sprintId: null },
      ]);

      const response = await request(app)
        .get('/search')
        .query({ q: 'task' });

      expect(response.status).toBe(200);
      expect(response.body.results).toEqual([
        {
          type: 'task',
          id: 1,
          title: 'Task 1',
          idTask: 'PROJ-1',
          subtitle: 'Sprint #1',
          route: '/backlog',
          meta: { sprintId: 1 },
        },
        {
          type: 'task',
          id: 2,
          title: 'Task 2',
          idTask: 'PROJ-2',
          subtitle: 'Backlog',
          route: '/backlog',
          meta: { sprintId: null },
        },
      ]);
    });

    test('deve formatar resultados de epics corretamente', async () => {
      mockPrismaClient.epic.findMany.mockResolvedValue([
        { id: 1, title: 'Epic Feature', key: 'EPIC-1' },
        { id: 2, title: 'Epic Infrastructure', key: 'EPIC-2' },
      ]);

      const response = await request(app)
        .get('/search')
        .query({ q: 'epic' });

      expect(response.status).toBe(200);
      expect(response.body.results).toEqual([
        {
          type: 'epic',
          id: 1,
          title: 'Epic Feature',
          key: 'EPIC-1',
          subtitle: 'EPIC-1',
          route: '/epic',
        },
        {
          type: 'epic',
          id: 2,
          title: 'Epic Infrastructure',
          key: 'EPIC-2',
          subtitle: 'EPIC-2',
          route: '/epic',
        },
      ]);
    });

    test('deve combinar tasks e epics nos resultados', async () => {
      mockPrismaClient.task.findMany.mockResolvedValue([
        { id: 1, title: 'Task 1', idTask: 'PROJ-1', status: 'todo', sprintId: 1 },
      ]);
      mockPrismaClient.epic.findMany.mockResolvedValue([
        { id: 1, title: 'Epic 1', key: 'EPIC-1' },
      ]);

      const response = await request(app)
        .get('/search')
        .query({ q: 'test' });

      expect(response.status).toBe(200);
      expect(response.body.results).toHaveLength(2);
      expect(response.body.results[0].type).toBe('task');
      expect(response.body.results[1].type).toBe('epic');
    });

    test('deve buscar apenas tasks quando types=tasks', async () => {
      mockPrismaClient.task.findMany.mockResolvedValue([
        { id: 1, title: 'Task 1', idTask: 'PROJ-1', status: 'todo', sprintId: 1 },
      ]);

      const response = await request(app)
        .get('/search')
        .query({ q: 'test', types: 'tasks' });

      expect(response.status).toBe(200);
      expect(mockPrismaClient.task.findMany).toHaveBeenCalled();
      expect(mockPrismaClient.epic.findMany).not.toHaveBeenCalled();
      expect(response.body.results).toHaveLength(1);
      expect(response.body.results[0].type).toBe('task');
    });

    test('deve buscar apenas epics quando types=epics', async () => {
      mockPrismaClient.epic.findMany.mockResolvedValue([
        { id: 1, title: 'Epic 1', key: 'EPIC-1' },
      ]);

      const response = await request(app)
        .get('/search')
        .query({ q: 'test', types: 'epics' });

      expect(response.status).toBe(200);
      expect(mockPrismaClient.task.findMany).not.toHaveBeenCalled();
      expect(mockPrismaClient.epic.findMany).toHaveBeenCalled();
      expect(response.body.results).toHaveLength(1);
      expect(response.body.results[0].type).toBe('epic');
    });

    test('deve respeitar o limit padrão de 10', async () => {
      const response = await request(app)
        .get('/search')
        .query({ q: 'test' });

      expect(mockPrismaClient.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 10 })
      );
      expect(mockPrismaClient.epic.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 10 })
      );
    });

    test('deve aceitar limit customizado', async () => {
      const response = await request(app)
        .get('/search')
        .query({ q: 'test', limit: '5' });

      expect(mockPrismaClient.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 5 })
      );
      expect(mockPrismaClient.epic.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 5 })
      );
    });

    test('deve limitar máximo a 20 resultados', async () => {
      const response = await request(app)
        .get('/search')
        .query({ q: 'test', limit: '100' });

      expect(mockPrismaClient.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 20 })
      );
      expect(mockPrismaClient.epic.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 20 })
      );
    });

    test('deve ter mínimo de 1 resultado', async () => {
      const response = await request(app)
        .get('/search')
        .query({ q: 'test', limit: '0' });

      expect(mockPrismaClient.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 1 })
      );
    });

    test('deve usar limit padrão para valores inválidos', async () => {
      const response = await request(app)
        .get('/search')
        .query({ q: 'test', limit: 'abc' });

      expect(mockPrismaClient.task.findMany).toHaveBeenCalled();

      const firstCallArg = mockPrismaClient.task.findMany.mock.calls[0][0];

      expect(firstCallArg.take).toBeNaN();

      if (mockPrismaClient.epic.findMany.mock.calls.length > 0) {
        const firstEpicArg = mockPrismaClient.epic.findMany.mock.calls[0][0];
        expect(firstEpicArg.take).toBeNaN();
      }
    });

    test('deve fazer trim na query', async () => {
      const response = await request(app)
        .get('/search')
        .query({ q: '  test  ' });

      expect(mockPrismaClient.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [
              { title: { contains: 'test', mode: 'insensitive' } },
              { idTask: { contains: 'test', mode: 'insensitive' } },
            ],
          },
        })
      );
    });

    test('deve buscar case insensitive', async () => {
      const response = await request(app)
        .get('/search')
        .query({ q: 'TeSt' });

      expect(mockPrismaClient.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: expect.arrayContaining([
              expect.objectContaining({
                title: { contains: 'TeSt', mode: 'insensitive' },
              }),
            ]),
          },
        })
      );
    });

    test('deve buscar por idTask', async () => {
      mockPrismaClient.task.findMany.mockResolvedValue([
        { id: 1, title: 'Task', idTask: 'PROJ-123', status: 'todo', sprintId: null },
      ]);

      const response = await request(app)
        .get('/search')
        .query({ q: 'PROJ-123' });

      expect(response.status).toBe(200);
      expect(response.body.results).toHaveLength(1);
      expect(response.body.results[0].idTask).toBe('PROJ-123');
    });

    test('deve buscar por key do epic', async () => {
      mockPrismaClient.epic.findMany.mockResolvedValue([
        { id: 1, title: 'Epic', key: 'EPIC-123' },
      ]);

      const response = await request(app)
        .get('/search')
        .query({ q: 'EPIC-123' });

      expect(response.status).toBe(200);
      expect(response.body.results).toHaveLength(1);
      expect(response.body.results[0].key).toBe('EPIC-123');
    });

    test('deve tratar erros do banco de dados', async () => {
      mockPrismaClient.task.findMany.mockRejectedValue(new Error('Database error'));

      const errorHandler = jest.fn((err, req, res, next) => {
        res.status(500).json({ error: err.message });
      });

      app.use(errorHandler);

      const response = await request(app)
        .get('/search')
        .query({ q: 'test' });

      expect(response.status).toBe(500);
      expect(errorHandler).toHaveBeenCalled();
    });

    test('deve retornar resultados mesmo se uma busca falhar', async () => {
      mockPrismaClient.task.findMany.mockResolvedValue([
        { id: 1, title: 'Task 1', idTask: 'PROJ-1', status: 'todo', sprintId: 1 },
      ]);
      mockPrismaClient.epic.findMany.mockRejectedValue(new Error('Epic search failed'));

      const errorHandler = jest.fn((err, req, res, next) => {
        res.status(500).json({ error: err.message });
      });

      app.use(errorHandler);

      const response = await request(app)
        .get('/search')
        .query({ q: 'test' });

      expect(response.status).toBe(500);
      expect(errorHandler).toHaveBeenCalled();
    });

    test('deve retornar array vazio quando nada é encontrado', async () => {
      mockPrismaClient.task.findMany.mockResolvedValue([]);
      mockPrismaClient.epic.findMany.mockResolvedValue([]);

      const response = await request(app)
        .get('/search')
        .query({ q: 'nonexistent' });

      expect(response.status).toBe(200);
      expect(response.body.results).toEqual([]);
    });

    test('deve lidar com caracteres especiais na query', async () => {
      const response = await request(app)
        .get('/search')
        .query({ q: 'test@#$%' });

      expect(response.status).toBe(200);
      expect(mockPrismaClient.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: expect.arrayContaining([
              { title: { contains: 'test@#$%', mode: 'insensitive' } },
            ]),
          },
        })
      );
    });

    test('deve funcionar com query unicode', async () => {
      const response = await request(app)
        .get('/search')
        .query({ q: 'tarefa açúcar' });

      expect(response.status).toBe(200);
      expect(mockPrismaClient.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: expect.arrayContaining([
              { title: { contains: 'tarefa açúcar', mode: 'insensitive' } },
            ]),
          },
        })
      );
    });

    test('deve manter ordem: tasks primeiro, epics depois', async () => {
      mockPrismaClient.task.findMany.mockResolvedValue([
        { id: 1, title: 'Task A', idTask: 'A-1', status: 'todo', sprintId: null },
        { id: 2, title: 'Task B', idTask: 'B-1', status: 'todo', sprintId: null },
      ]);
      mockPrismaClient.epic.findMany.mockResolvedValue([
        { id: 1, title: 'Epic X', key: 'X-1' },
        { id: 2, title: 'Epic Y', key: 'Y-1' },
      ]);

      const response = await request(app)
        .get('/search')
        .query({ q: 'test' });

      expect(response.body.results).toHaveLength(4);
      expect(response.body.results[0].type).toBe('task');
      expect(response.body.results[1].type).toBe('task');
      expect(response.body.results[2].type).toBe('epic');
      expect(response.body.results[3].type).toBe('epic');
    });
  });
});