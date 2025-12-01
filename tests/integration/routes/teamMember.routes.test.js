const request = require('supertest');
const express = require('express');
const teamMemberRoutes = require('../../../src/routes/teamMember.routes');
const teamMemberController = require('../../../src/controllers/teamMember.controller');
const { authRequired } = require('../../../src/middlewares/auth');

jest.mock('../../../src/controllers/teamMember.controller');
jest.mock('../../../src/middlewares/auth');

describe('TeamMember Routes', () => {
  let app;

  beforeEach(() => {
    authRequired.mockImplementation((req, res, next) => {
      req.user = { id: 1 };
      next();
    });
    
    app = express();
    app.use(express.json());
    app.use('/team-members', teamMemberRoutes);
    jest.clearAllMocks();
  });

  describe('GET /team-members/:teamId', () => {
    test('deve chamar controller getMembers', async () => {
      teamMemberController.getMembers.mockImplementation((req, res) => {
        res.json([]);
      });

      const response = await request(app).get('/team-members/1');

      expect(teamMemberController.getMembers).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });

    test('deve retornar lista de membros da equipe', async () => {
      const mockMembers = [
        { id: 1, teamId: 1, userId: 10, user: { name: 'João' } },
        { id: 2, teamId: 1, userId: 20, user: { name: 'Maria' } },
      ];
      teamMemberController.getMembers.mockImplementation((req, res) => {
        res.json(mockMembers);
      });

      const response = await request(app).get('/team-members/1');

      expect(response.body).toEqual(mockMembers);
    });

    test('deve passar teamId correto', async () => {
      teamMemberController.getMembers.mockImplementation((req, res) => {
        res.json({ teamId: parseInt(req.params.teamId) });
      });

      const response = await request(app).get('/team-members/5');

      expect(response.body.teamId).toBe(5);
    });
  });

  describe('GET /team-members/available/:teamId', () => {
    test('deve chamar controller getAvailableUsers', async () => {
      teamMemberController.getAvailableUsers.mockImplementation((req, res) => {
        res.json([]);
      });

      const response = await request(app).get('/team-members/available/1');

      expect(teamMemberController.getAvailableUsers).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });

    test('deve retornar usuários disponíveis', async () => {
      const mockUsers = [
        { id: 30, name: 'Carlos' },
        { id: 40, name: 'Ana' },
      ];
      teamMemberController.getAvailableUsers.mockImplementation((req, res) => {
        res.json(mockUsers);
      });

      const response = await request(app).get('/team-members/available/1');

      expect(response.body).toEqual(mockUsers);
    });

    test('deve passar teamId correto', async () => {
      teamMemberController.getAvailableUsers.mockImplementation((req, res) => {
        res.json({ teamId: parseInt(req.params.teamId) });
      });

      const response = await request(app).get('/team-members/available/3');

      expect(response.body.teamId).toBe(3);
    });
  });

  describe('POST /team-members/:teamId', () => {
    test('deve chamar controller addMembers', async () => {
      teamMemberController.addMembers.mockImplementation((req, res) => {
        res.status(201).json({ count: 2 });
      });

      const response = await request(app)
        .post('/team-members/1')
        .send({ userIds: [10, 20] });

      expect(teamMemberController.addMembers).toHaveBeenCalled();
      expect(response.status).toBe(201);
    });

    test('deve adicionar membros com dados corretos', async () => {
      teamMemberController.addMembers.mockImplementation((req, res) => {
        res.status(201).json({ count: req.body.userIds.length });
      });

      const response = await request(app)
        .post('/team-members/1')
        .send({ userIds: [5, 10, 15] });

      expect(response.body.count).toBe(3);
    });

    test('deve passar teamId correto', async () => {
      teamMemberController.addMembers.mockImplementation((req, res) => {
        res.status(201).json({ teamId: parseInt(req.params.teamId) });
      });

      const response = await request(app)
        .post('/team-members/7')
        .send({ userIds: [1] });

      expect(response.body.teamId).toBe(7);
    });
  });

  describe('DELETE /team-members/:teamId/:userId', () => {
    test('deve chamar controller removeMember', async () => {
      teamMemberController.removeMember.mockImplementation((req, res) => {
        res.json({ message: 'Membro removido com sucesso' });
      });

      const response = await request(app).delete('/team-members/1/10');

      expect(teamMemberController.removeMember).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });

    test('deve remover membro com ids corretos', async () => {
      teamMemberController.removeMember.mockImplementation((req, res) => {
        res.json({
          teamId: parseInt(req.params.teamId),
          userId: parseInt(req.params.userId),
        });
      });

      const response = await request(app).delete('/team-members/5/15');

      expect(response.body).toEqual({ teamId: 5, userId: 15 });
    });

    test('deve retornar mensagem de sucesso', async () => {
      teamMemberController.removeMember.mockImplementation((req, res) => {
        res.json({ message: 'Membro removido com sucesso' });
      });

      const response = await request(app).delete('/team-members/1/10');

      expect(response.body.message).toBe('Membro removido com sucesso');
    });
  });
});