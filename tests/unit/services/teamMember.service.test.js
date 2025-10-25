const mockPrismaClient = {
  teamMember: {
    findMany: jest.fn(),
    createMany: jest.fn(),
    deleteMany: jest.fn(),
  },
  user: {
    findMany: jest.fn(),
  },
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrismaClient),
}));

const teamMemberService = require('../../../src/services/teamMember.service');

describe('TeamMember Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getMembersByTeam', () => {
    test('deve retornar membros de uma equipe', async () => {
      const mockMembers = [
        { id: 1, teamId: 1, userId: 10, user: { id: 10, name: 'João' } },
        { id: 2, teamId: 1, userId: 20, user: { id: 20, name: 'Maria' } },
      ];
      mockPrismaClient.teamMember.findMany.mockResolvedValue(mockMembers);

      const result = await teamMemberService.getMembersByTeam(1);

      expect(mockPrismaClient.teamMember.findMany).toHaveBeenCalledWith({
        where: { teamId: 1 },
        include: { user: true },
      });
      expect(result).toEqual(mockMembers);
      expect(result).toHaveLength(2);
    });

    test('deve retornar array vazio quando equipe não tiver membros', async () => {
      mockPrismaClient.teamMember.findMany.mockResolvedValue([]);

      const result = await teamMemberService.getMembersByTeam(999);

      expect(result).toEqual([]);
    });

    test('deve incluir dados completos do usuário', async () => {
      const mockMembers = [
        {
          id: 1,
          teamId: 5,
          userId: 100,
          user: { id: 100, name: 'Carlos', email: 'carlos@test.com' },
        },
      ];
      mockPrismaClient.teamMember.findMany.mockResolvedValue(mockMembers);

      const result = await teamMemberService.getMembersByTeam(5);

      expect(result[0].user).toHaveProperty('email');
    });
  });

  describe('addMembers', () => {
    test('deve adicionar múltiplos membros', async () => {
      const teamId = 1;
      const userIds = [10, 20, 30];
      mockPrismaClient.teamMember.createMany.mockResolvedValue({ count: 3 });

      const result = await teamMemberService.addMembers(teamId, userIds);

      expect(mockPrismaClient.teamMember.createMany).toHaveBeenCalledWith({
        data: [
          { userId: 10, teamId: 1 },
          { userId: 20, teamId: 1 },
          { userId: 30, teamId: 1 },
        ],
        skipDuplicates: true,
      });
      expect(result.count).toBe(3);
    });

    test('deve adicionar um único membro', async () => {
      const teamId = 2;
      const userIds = [15];
      mockPrismaClient.teamMember.createMany.mockResolvedValue({ count: 1 });

      const result = await teamMemberService.addMembers(teamId, userIds);

      expect(mockPrismaClient.teamMember.createMany).toHaveBeenCalledWith({
        data: [{ userId: 15, teamId: 2 }],
        skipDuplicates: true,
      });
      expect(result.count).toBe(1);
    });

    test('deve usar skipDuplicates para evitar duplicatas', async () => {
      mockPrismaClient.teamMember.createMany.mockResolvedValue({ count: 2 });

      await teamMemberService.addMembers(1, [5, 10]);

      expect(mockPrismaClient.teamMember.createMany).toHaveBeenCalledWith(
        expect.objectContaining({ skipDuplicates: true })
      );
    });

    test('deve funcionar com array vazio', async () => {
      mockPrismaClient.teamMember.createMany.mockResolvedValue({ count: 0 });

      const result = await teamMemberService.addMembers(1, []);

      expect(mockPrismaClient.teamMember.createMany).toHaveBeenCalledWith({
        data: [],
        skipDuplicates: true,
      });
      expect(result.count).toBe(0);
    });
  });

  describe('removeMember', () => {
    test('deve remover membro de uma equipe', async () => {
      const teamId = 1;
      const userId = 10;
      mockPrismaClient.teamMember.deleteMany.mockResolvedValue({ count: 1 });

      const result = await teamMemberService.removeMember(teamId, userId);

      expect(mockPrismaClient.teamMember.deleteMany).toHaveBeenCalledWith({
        where: { teamId: 1, userId: 10 },
      });
      expect(result.count).toBe(1);
    });

    test('deve retornar count 0 quando membro não existir', async () => {
      mockPrismaClient.teamMember.deleteMany.mockResolvedValue({ count: 0 });

      const result = await teamMemberService.removeMember(999, 999);

      expect(result.count).toBe(0);
    });

    test('deve usar deleteMany para remover relação', async () => {
      mockPrismaClient.teamMember.deleteMany.mockResolvedValue({ count: 1 });

      await teamMemberService.removeMember(5, 50);

      expect(mockPrismaClient.teamMember.deleteMany).toHaveBeenCalledWith({
        where: { teamId: 5, userId: 50 },
      });
    });
  });

  describe('getAvailableUsers', () => {
    test('deve retornar usuários que não estão na equipe', async () => {
      mockPrismaClient.teamMember.findMany.mockResolvedValue([
        { userId: 10 },
        { userId: 20 },
      ]);

      const mockAvailableUsers = [
        { id: 30, name: 'Carlos' },
        { id: 40, name: 'Ana' },
      ];
      mockPrismaClient.user.findMany.mockResolvedValue(mockAvailableUsers);

      const result = await teamMemberService.getAvailableUsers(1);

      expect(mockPrismaClient.teamMember.findMany).toHaveBeenCalledWith({
        where: { teamId: 1 },
        select: { userId: true },
      });
      expect(mockPrismaClient.user.findMany).toHaveBeenCalledWith({
        where: {
          id: {
            notIn: [10, 20],
          },
        },
        select: {
          id: true,
          name: true,
        },
      });
      expect(result).toEqual(mockAvailableUsers);
    });

    test('deve retornar todos os usuários quando equipe não tiver membros', async () => {
      mockPrismaClient.teamMember.findMany.mockResolvedValue([]);

      const mockAllUsers = [
        { id: 1, name: 'João' },
        { id: 2, name: 'Maria' },
      ];
      mockPrismaClient.user.findMany.mockResolvedValue(mockAllUsers);

      const result = await teamMemberService.getAvailableUsers(999);

      expect(mockPrismaClient.user.findMany).toHaveBeenCalledWith({
        where: {
          id: {
            notIn: [0],
          },
        },
        select: {
          id: true,
          name: true,
        },
      });
      expect(result).toEqual(mockAllUsers);
    });

    test('deve retornar apenas id e name dos usuários', async () => {
      mockPrismaClient.teamMember.findMany.mockResolvedValue([]);
      mockPrismaClient.user.findMany.mockResolvedValue([{ id: 1, name: 'Test' }]);

      await teamMemberService.getAvailableUsers(1);

      expect(mockPrismaClient.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          select: {
            id: true,
            name: true,
          },
        })
      );
    });

    test('deve excluir múltiplos usuários já membros', async () => {
      mockPrismaClient.teamMember.findMany.mockResolvedValue([
        { userId: 1 },
        { userId: 2 },
        { userId: 3 },
      ]);
      mockPrismaClient.user.findMany.mockResolvedValue([]);

      await teamMemberService.getAvailableUsers(1);

      expect(mockPrismaClient.user.findMany).toHaveBeenCalledWith({
        where: {
          id: {
            notIn: [1, 2, 3],
          },
        },
        select: {
          id: true,
          name: true,
        },
      });
    });

    test('deve usar [0] como fallback quando não houver membros', async () => {
      mockPrismaClient.teamMember.findMany.mockResolvedValue([]);
      mockPrismaClient.user.findMany.mockResolvedValue([]);

      await teamMemberService.getAvailableUsers(5);

      expect(mockPrismaClient.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            id: {
              notIn: [0],
            },
          },
        })
      );
    });
  });
});