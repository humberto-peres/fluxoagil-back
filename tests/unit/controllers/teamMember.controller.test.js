const teamMemberController = require('../../../src/controllers/teamMember.controller');
const teamMemberService = require('../../../src/services/teamMember.service');

jest.mock('../../../src/services/teamMember.service');

describe('TeamMember Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: {},
      body: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  describe('getMembers', () => {
    test('deve retornar membros da equipe', async () => {
      const mockMembers = [
        { id: 1, teamId: 1, userId: 10, user: { name: 'João' } },
        { id: 2, teamId: 1, userId: 20, user: { name: 'Maria' } },
      ];
      req.params.teamId = '1';
      teamMemberService.getMembersByTeam.mockResolvedValue(mockMembers);

      await teamMemberController.getMembers(req, res);

      expect(teamMemberService.getMembersByTeam).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith(mockMembers);
    });

    test('deve converter teamId string para número', async () => {
      req.params.teamId = '123';
      teamMemberService.getMembersByTeam.mockResolvedValue([]);

      await teamMemberController.getMembers(req, res);

      expect(teamMemberService.getMembersByTeam).toHaveBeenCalledWith(123);
    });

    test('deve retornar array vazio quando não houver membros', async () => {
      req.params.teamId = '1';
      teamMemberService.getMembersByTeam.mockResolvedValue([]);

      await teamMemberController.getMembers(req, res);

      expect(res.json).toHaveBeenCalledWith([]);
    });

    test('deve retornar 500 em caso de erro', async () => {
      req.params.teamId = '1';
      const error = new Error('Database error');
      teamMemberService.getMembersByTeam.mockRejectedValue(error);

      await teamMemberController.getMembers(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Erro ao buscar membros',
        error,
      });
    });
  });

  describe('getAvailableUsers', () => {
    test('deve retornar usuários disponíveis', async () => {
      const mockUsers = [
        { id: 30, name: 'Carlos' },
        { id: 40, name: 'Ana' },
      ];
      req.params.teamId = '1';
      teamMemberService.getAvailableUsers.mockResolvedValue(mockUsers);

      await teamMemberController.getAvailableUsers(req, res);

      expect(teamMemberService.getAvailableUsers).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith(mockUsers);
    });

    test('deve converter teamId string para número', async () => {
      req.params.teamId = '456';
      teamMemberService.getAvailableUsers.mockResolvedValue([]);

      await teamMemberController.getAvailableUsers(req, res);

      expect(teamMemberService.getAvailableUsers).toHaveBeenCalledWith(456);
    });

    test('deve retornar array vazio quando não houver usuários disponíveis', async () => {
      req.params.teamId = '1';
      teamMemberService.getAvailableUsers.mockResolvedValue([]);

      await teamMemberController.getAvailableUsers(req, res);

      expect(res.json).toHaveBeenCalledWith([]);
    });

    test('deve retornar 500 em caso de erro', async () => {
      req.params.teamId = '1';
      const error = new Error('Query failed');
      teamMemberService.getAvailableUsers.mockRejectedValue(error);

      await teamMemberController.getAvailableUsers(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Erro ao buscar usuários disponíveis',
        error,
      });
    });
  });

  describe('addMembers', () => {
    test('deve adicionar membros com sucesso', async () => {
      req.params.teamId = '1';
      req.body = { userIds: [10, 20, 30] };
      teamMemberService.addMembers.mockResolvedValue({ count: 3 });

      await teamMemberController.addMembers(req, res);

      expect(teamMemberService.addMembers).toHaveBeenCalledWith(1, [10, 20, 30]);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ count: 3 });
    });

    test('deve converter teamId string para número', async () => {
      req.params.teamId = '789';
      req.body = { userIds: [5] };
      teamMemberService.addMembers.mockResolvedValue({ count: 1 });

      await teamMemberController.addMembers(req, res);

      expect(teamMemberService.addMembers).toHaveBeenCalledWith(789, [5]);
    });

    test('deve adicionar um único membro', async () => {
      req.params.teamId = '1';
      req.body = { userIds: [15] };
      teamMemberService.addMembers.mockResolvedValue({ count: 1 });

      await teamMemberController.addMembers(req, res);

      expect(teamMemberService.addMembers).toHaveBeenCalledWith(1, [15]);
      expect(res.status).toHaveBeenCalledWith(201);
    });

    test('deve retornar 500 em caso de erro', async () => {
      req.params.teamId = '1';
      req.body = { userIds: [10] };
      const error = new Error('Insert failed');
      teamMemberService.addMembers.mockRejectedValue(error);

      await teamMemberController.addMembers(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Erro ao adicionar membros',
        error,
      });
    });
  });

  describe('removeMember', () => {
    test('deve remover membro com sucesso', async () => {
      req.params.teamId = '1';
      req.params.userId = '10';
      teamMemberService.removeMember.mockResolvedValue({ count: 1 });

      await teamMemberController.removeMember(req, res);

      expect(teamMemberService.removeMember).toHaveBeenCalledWith(1, 10);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Membro removido com sucesso',
      });
    });

    test('deve converter teamId e userId para número', async () => {
      req.params.teamId = '5';
      req.params.userId = '50';
      teamMemberService.removeMember.mockResolvedValue({ count: 1 });

      await teamMemberController.removeMember(req, res);

      expect(teamMemberService.removeMember).toHaveBeenCalledWith(5, 50);
    });

    test('deve retornar mensagem de sucesso mesmo quando membro não existir', async () => {
      req.params.teamId = '1';
      req.params.userId = '999';
      teamMemberService.removeMember.mockResolvedValue({ count: 0 });

      await teamMemberController.removeMember(req, res);

      expect(res.json).toHaveBeenCalledWith({
        message: 'Membro removido com sucesso',
      });
    });

    test('deve retornar 500 em caso de erro', async () => {
      req.params.teamId = '1';
      req.params.userId = '10';
      const error = new Error('Delete failed');
      teamMemberService.removeMember.mockRejectedValue(error);

      await teamMemberController.removeMember(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Erro ao remover membro',
        error,
      });
    });
  });
});