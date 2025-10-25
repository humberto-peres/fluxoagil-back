const request = require('supertest');
const express = require('express');
const sprintRoutes = require('../../../src/routes/sprint.routes');
const sprintController = require('../../../src/controllers/sprint.controller');

jest.mock('../../../src/controllers/sprint.controller');

describe('Sprint Routes', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/sprints', sprintRoutes);
    jest.clearAllMocks();
  });

  describe('GET /sprints', () => {
    test('deve chamar controller getAll', async () => {
      sprintController.getAll.mockImplementation((req, res) => {
        res.json([]);
      });

      const response = await request(app).get('/sprints');

      expect(sprintController.getAll).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });

    test('deve retornar lista de sprints', async () => {
      const mockSprints = [
        { id: 1, name: 'Sprint 1', workspaceId: 1, isActive: true },
        { id: 2, name: 'Sprint 2', workspaceId: 1, isActive: false },
      ];
      sprintController.getAll.mockImplementation((req, res) => {
        res.json(mockSprints);
      });

      const response = await request(app).get('/sprints');

      expect(response.body).toEqual(mockSprints);
    });

    test('deve passar query params para o controller', async () => {
      sprintController.getAll.mockImplementation((req, res) => {
        res.json([]);
      });

      await request(app)
        .get('/sprints')
        .query({ workspaceId: '1', state: 'active' });

      expect(sprintController.getAll).toHaveBeenCalled();
      const req = sprintController.getAll.mock.calls[0][0];
      expect(req.query.workspaceId).toBe('1');
      expect(req.query.state).toBe('active');
    });
  });

  describe('GET /sprints/:id', () => {
    test('deve chamar controller getById', async () => {
      sprintController.getById.mockImplementation((req, res) => {
        res.json({ id: 1 });
      });

      const response = await request(app).get('/sprints/1');

      expect(sprintController.getById).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });

    test('deve passar id correto', async () => {
      sprintController.getById.mockImplementation((req, res) => {
        res.json({ id: parseInt(req.params.id) });
      });

      const response = await request(app).get('/sprints/123');

      expect(response.body.id).toBe(123);
    });

    test('deve retornar 404 se sprint não existir', async () => {
      sprintController.getById.mockImplementation((req, res) => {
        res.status(404).json({ message: 'Não encontrada' });
      });

      const response = await request(app).get('/sprints/999');

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Não encontrada');
    });
  });

  describe('POST /sprints', () => {
    test('deve chamar controller create', async () => {
      sprintController.create.mockImplementation((req, res) => {
        res.status(201).json({ id: 1, ...req.body });
      });

      const response = await request(app)
        .post('/sprints')
        .send({ name: 'Nova Sprint', workspaceId: 1 });

      expect(sprintController.create).toHaveBeenCalled();
      expect(response.status).toBe(201);
    });

    test('deve criar sprint com dados corretos', async () => {
      const newSprint = {
        name: 'Sprint 2024',
        workspaceId: 1,
        startDate: '2024-01-01',
        endDate: '2024-01-15'
      };
      sprintController.create.mockImplementation((req, res) => {
        res.status(201).json({ id: 5, ...req.body });
      });

      const response = await request(app)
        .post('/sprints')
        .send(newSprint);

      expect(response.body).toMatchObject(newSprint);
      expect(response.body.id).toBe(5);
    });

    test('deve criar sprint inativa', async () => {
      const newSprint = {
        name: 'Planejada',
        workspaceId: 1,
        isActive: false
      };
      sprintController.create.mockImplementation((req, res) => {
        res.status(201).json({ id: 6, ...req.body });
      });

      const response = await request(app)
        .post('/sprints')
        .send(newSprint);

      expect(response.body.isActive).toBe(false);
    });
  });

  describe('PUT /sprints/:id', () => {
    test('deve chamar controller update', async () => {
      sprintController.update.mockImplementation((req, res) => {
        res.json({ id: 1, ...req.body });
      });

      const response = await request(app)
        .put('/sprints/1')
        .send({ name: 'Sprint Atualizada' });

      expect(sprintController.update).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });

    test('deve atualizar com dados corretos', async () => {
      sprintController.update.mockImplementation((req, res) => {
        res.json({ id: parseInt(req.params.id), ...req.body });
      });

      const response = await request(app)
        .put('/sprints/2')
        .send({ name: 'Sprint Modificada' });

      expect(response.body).toEqual({ id: 2, name: 'Sprint Modificada' });
    });

    test('deve atualizar múltiplos campos', async () => {
      const updateData = {
        name: 'Nova Sprint',
        startDate: '2024-02-01',
        endDate: '2024-02-15'
      };
      sprintController.update.mockImplementation((req, res) => {
        res.json({ id: parseInt(req.params.id), ...req.body });
      });

      const response = await request(app)
        .put('/sprints/3')
        .send(updateData);

      expect(response.body).toMatchObject(updateData);
    });
  });

  describe('DELETE /sprints', () => {
    test('deve chamar controller removeMany', async () => {
      sprintController.removeMany.mockImplementation((req, res) => {
        res.json({ message: 'Removida(s) com sucesso!' });
      });

      const response = await request(app)
        .delete('/sprints')
        .send({ ids: [1, 2] });

      expect(sprintController.removeMany).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });

    test('deve remover com ids corretos', async () => {
      sprintController.removeMany.mockImplementation((req, res) => {
        res.json({ message: 'Removida(s) com sucesso!', count: req.body.ids.length });
      });

      const response = await request(app)
        .delete('/sprints')
        .send({ ids: [1, 2, 3] });

      expect(response.body.count).toBe(3);
    });

    test('deve funcionar com array vazio', async () => {
      sprintController.removeMany.mockImplementation((req, res) => {
        res.json({ message: 'Removida(s) com sucesso!', count: 0 });
      });

      const response = await request(app)
        .delete('/sprints')
        .send({ ids: [] });

      expect(response.status).toBe(200);
      expect(response.body.count).toBe(0);
    });
  });

  describe('POST /sprints/:id/activate', () => {
    test('deve chamar controller activate', async () => {
      sprintController.activate.mockImplementation((req, res) => {
        res.json({ id: parseInt(req.params.id), isActive: true });
      });

      const response = await request(app).post('/sprints/1/activate');

      expect(sprintController.activate).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });

    test('deve ativar sprint correta', async () => {
      sprintController.activate.mockImplementation((req, res) => {
        res.json({ id: parseInt(req.params.id), isActive: true });
      });

      const response = await request(app).post('/sprints/7/activate');

      expect(response.body).toEqual({ id: 7, isActive: true });
    });

    test('deve retornar erro se sprint já estiver ativa', async () => {
      sprintController.activate.mockImplementation((req, res) => {
        res.status(400).json({ error: 'Sprint já está ativa' });
      });

      const response = await request(app).post('/sprints/1/activate');

      expect(response.status).toBe(400);
    });
  });

  describe('POST /sprints/:id/close', () => {
    test('deve chamar controller close', async () => {
      sprintController.close.mockImplementation((req, res) => {
        res.json({ sprint: { id: parseInt(req.params.id) }, movedCount: 0 });
      });

      const response = await request(app).post('/sprints/1/close');

      expect(sprintController.close).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });

    test('deve encerrar sprint correta', async () => {
      sprintController.close.mockImplementation((req, res) => {
        res.json({ 
          sprint: { id: parseInt(req.params.id), closedAt: new Date() },
          movedCount: 5 
        });
      });

      const response = await request(app).post('/sprints/10/close');

      expect(response.body.sprint.id).toBe(10);
      expect(response.body.movedCount).toBe(5);
    });

    test('deve passar move options no body', async () => {
      const moveOptions = {
        move: {
          to: 'sprint',
          sprintId: 2
        }
      };
      sprintController.close.mockImplementation((req, res) => {
        res.json({ 
          sprint: { id: parseInt(req.params.id) },
          movedCount: 3,
          move: req.body.move
        });
      });

      const response = await request(app)
        .post('/sprints/1/close')
        .send(moveOptions);

      expect(response.body.move).toEqual(moveOptions.move);
    });

    test('deve aceitar move para backlog', async () => {
      const moveOptions = { move: { to: 'backlog' } };
      sprintController.close.mockImplementation((req, res) => {
        res.json({ 
          sprint: { id: parseInt(req.params.id) },
          movedCount: 8
        });
      });

      const response = await request(app)
        .post('/sprints/1/close')
        .send(moveOptions);

      expect(response.status).toBe(200);
      expect(response.body.movedCount).toBe(8);
    });

    test('deve funcionar sem move options', async () => {
      sprintController.close.mockImplementation((req, res) => {
        res.json({ 
          sprint: { id: parseInt(req.params.id) },
          movedCount: 0
        });
      });

      const response = await request(app)
        .post('/sprints/1/close')
        .send({});

      expect(response.status).toBe(200);
    });
  });
});