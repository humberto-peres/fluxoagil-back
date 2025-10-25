const request = require('supertest');
const express = require('express');
const taskRoutes = require('../../../src/routes/task.routes');
const taskController = require('../../../src/controllers/task.controller');
const { authRequired } = require('../../../src/middlewares/auth');

jest.mock('../../../src/controllers/task.controller');
jest.mock('../../../src/middlewares/auth');

describe('Task Routes', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    
    authRequired.mockImplementation((req, res, next) => {
      req.user = { id: 1 };
      next();
    });
    
    app.use('/tasks', taskRoutes);
    jest.clearAllMocks();
  });

  describe('GET /tasks/all', () => {
    test('deve chamar controller getAllTasks', async () => {
      taskController.getAllTasks.mockImplementation((req, res) => {
        res.json([]);
      });

      const response = await request(app).get('/tasks/all');

      expect(taskController.getAllTasks).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });

    test('deve retornar lista de todas as tarefas', async () => {
      const mockTasks = [
        { id: 1, title: 'Task 1', idTask: 'PROJ-1' },
        { id: 2, title: 'Task 2', idTask: 'PROJ-2' },
      ];
      taskController.getAllTasks.mockImplementation((req, res) => {
        res.json(mockTasks);
      });

      const response = await request(app).get('/tasks/all');

      expect(response.body).toEqual(mockTasks);
    });
  });

  describe('GET /tasks', () => {
    test('deve chamar controller getTasks', async () => {
      taskController.getTasks.mockImplementation((req, res) => {
        res.json([]);
      });

      const response = await request(app).get('/tasks');

      expect(taskController.getTasks).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });

    test('deve retornar tarefas filtradas por workspaceId', async () => {
      const mockTasks = [{ id: 1, workspaceId: 5 }];
      taskController.getTasks.mockImplementation((req, res) => {
        res.json(mockTasks);
      });

      const response = await request(app).get('/tasks?workspaceId=5');

      expect(response.body).toEqual(mockTasks);
    });

    test('deve retornar tarefas filtradas por stepId', async () => {
      taskController.getTasks.mockImplementation((req, res) => {
        res.json([]);
      });

      await request(app).get('/tasks?stepId=2');

      expect(taskController.getTasks).toHaveBeenCalled();
    });

    test('deve retornar tarefas filtradas por sprintId', async () => {
      taskController.getTasks.mockImplementation((req, res) => {
        res.json([]);
      });

      await request(app).get('/tasks?sprintId=3');

      expect(taskController.getTasks).toHaveBeenCalled();
    });
  });

  describe('GET /tasks/:id', () => {
    test('deve chamar controller getById', async () => {
      taskController.getById.mockImplementation((req, res) => {
        res.json({ id: 1 });
      });

      const response = await request(app).get('/tasks/1');

      expect(taskController.getById).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });

    test('deve passar id correto', async () => {
      taskController.getById.mockImplementation((req, res) => {
        res.json({ id: parseInt(req.params.id) });
      });

      const response = await request(app).get('/tasks/123');

      expect(response.body.id).toBe(123);
    });
  });

  describe('POST /tasks', () => {
    test('deve chamar controller create', async () => {
      taskController.create.mockImplementation((req, res) => {
        res.status(201).json({ id: 1, ...req.body });
      });

      const response = await request(app)
        .post('/tasks')
        .send({ title: 'Nova Task', workspaceId: 1 });

      expect(taskController.create).toHaveBeenCalled();
      expect(response.status).toBe(201);
    });

    test('deve criar tarefa com dados corretos', async () => {
      const newTask = {
        title: 'Implementar feature',
        workspaceId: 1,
        stepId: 2,
        priorityId: 1,
        typeTaskId: 1,
      };
      taskController.create.mockImplementation((req, res) => {
        res.status(201).json({ id: 1, ...req.body });
      });

      const response = await request(app)
        .post('/tasks')
        .send(newTask);

      expect(response.body).toMatchObject(newTask);
    });
  });

  describe('PUT /tasks/:id', () => {
    test('deve chamar controller update', async () => {
      taskController.update.mockImplementation((req, res) => {
        res.json({ id: 1, ...req.body });
      });

      const response = await request(app)
        .put('/tasks/1')
        .send({ title: 'Atualizado' });

      expect(taskController.update).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });

    test('deve atualizar com dados corretos', async () => {
      taskController.update.mockImplementation((req, res) => {
        res.json({ id: parseInt(req.params.id), ...req.body });
      });

      const response = await request(app)
        .put('/tasks/5')
        .send({ title: 'Novo título' });

      expect(response.body).toEqual({ id: 5, title: 'Novo título' });
    });
  });

  describe('DELETE /tasks', () => {
    test('deve chamar controller removeMany', async () => {
      taskController.removeMany.mockImplementation((req, res) => {
        res.json({ message: 'Removida(s) com sucesso!' });
      });

      const response = await request(app)
        .delete('/tasks')
        .send({ ids: [1, 2] });

      expect(taskController.removeMany).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });

    test('deve remover com ids corretos', async () => {
      taskController.removeMany.mockImplementation((req, res) => {
        res.json({ message: 'Removida(s) com sucesso!', count: req.body.ids.length });
      });

      const response = await request(app)
        .delete('/tasks')
        .send({ ids: [1, 2, 3] });

      expect(response.body.count).toBe(3);
    });
  });

  describe('PUT /tasks/:id/move', () => {
    test('deve chamar controller move', async () => {
      taskController.move.mockImplementation((req, res) => {
        res.json({ id: 1, stepId: 5 });
      });

      const response = await request(app)
        .put('/tasks/1/move')
        .send({ stepId: 5 });

      expect(taskController.move).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });

    test('deve mover tarefa com stepId correto', async () => {
      taskController.move.mockImplementation((req, res) => {
        res.json({ id: parseInt(req.params.id), stepId: req.body.stepId });
      });

      const response = await request(app)
        .put('/tasks/10/move')
        .send({ stepId: 3 });

      expect(response.body).toEqual({ id: 10, stepId: 3 });
    });
  });

  describe('Middleware de autenticação', () => {
    test('deve aplicar authRequired em todas as rotas', async () => {
      taskController.getTasks.mockImplementation((req, res) => {
        res.json([]);
      });

      await request(app).get('/tasks');

      expect(authRequired).toHaveBeenCalled();
    });
  });
});