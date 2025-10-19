const mockPrismaClient = {
  team: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    deleteMany: jest.fn(),
  },
  teamMember: {
    deleteMany: jest.fn(),
  },
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrismaClient),
}));

const teamService = require('../../../src/services/team.service');

describe('Team Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    test('deve retornar todas as equipes', async () => {
      const mockTeams = [
        { id: 1, name: 'Dev Team', members: [] },
        { id: 2, name: 'QA Team', members: [] },
        { id: 3, name: 'Design Team', members: [] },
      ];
      mockPrismaClient.team.findMany.mockResolvedValue(mockTeams);

      const result = await teamService.getAll();

      expect(mockPrismaClient.team.findMany).toHaveBeenCalledWith({
        select: {
          id: true,
          name: true,
          members: {
            select: { user: true },
          },
        },
      });
      expect(result).toEqual(mockTeams);
      expect(result).toHaveLength(3);
    });

    test('deve retornar array vazio quando não houver equipes', async () => {
      mockPrismaClient.team.findMany.mockResolvedValue([]);

      const result = await teamService.getAll();

      expect(result).toEqual([]);
    });

    test('deve retornar equipes com membros', async () => {
      const mockTeams = [
        {
          id: 1,
          name: 'Dev Team',
          members: [
            { user: { id: 1, name: 'João' } },
            { user: { id: 2, name: 'Maria' } },
          ],
        },
      ];
      mockPrismaClient.team.findMany.mockResolvedValue(mockTeams);

      const result = await teamService.getAll();

      expect(result[0].members).toHaveLength(2);
    });
  });

  describe('getById', () => {
    test('deve retornar equipe por id', async () => {
      const mockTeam = {
        id: 1,
        name: 'Dev Team',
        members: [{ user: { id: 1, name: 'João' } }],
      };
      mockPrismaClient.team.findUnique.mockResolvedValue(mockTeam);

      const result = await teamService.getById(1);

      expect(mockPrismaClient.team.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          members: {
            include: { user: true },
          },
        },
      });
      expect(result).toEqual(mockTeam);
    });

    test('deve retornar null quando equipe não existir', async () => {
      mockPrismaClient.team.findUnique.mockResolvedValue(null);

      const result = await teamService.getById(999);

      expect(result).toBeNull();
    });

    test('deve incluir dados completos dos membros', async () => {
      const mockTeam = {
        id: 1,
        name: 'Dev Team',
        members: [
          {
            id: 1,
            teamId: 1,
            userId: 10,
            user: { id: 10, name: 'João', email: 'joao@test.com' },
          },
        ],
      };
      mockPrismaClient.team.findUnique.mockResolvedValue(mockTeam);

      const result = await teamService.getById(1);

      expect(result.members[0].user).toHaveProperty('email');
    });
  });

  describe('create', () => {
    test('deve criar equipe com sucesso', async () => {
      const newTeam = { name: 'Mobile Team' };
      const createdTeam = { id: 4, ...newTeam };
      mockPrismaClient.team.create.mockResolvedValue(createdTeam);

      const result = await teamService.create(newTeam);

      expect(mockPrismaClient.team.create).toHaveBeenCalledWith({
        data: { name: 'Mobile Team' },
      });
      expect(result).toEqual(createdTeam);
    });

    test('deve criar equipe apenas com nome', async () => {
      const newTeam = { name: 'Backend Team' };
      mockPrismaClient.team.create.mockResolvedValue({ id: 5, ...newTeam });

      await teamService.create(newTeam);

      expect(mockPrismaClient.team.create).toHaveBeenCalledWith({
        data: { name: 'Backend Team' },
      });
    });

    test('deve ignorar campos extras e usar apenas name', async () => {
      const newTeam = { name: 'Test Team', extraField: 'ignored' };
      mockPrismaClient.team.create.mockResolvedValue({ id: 6, name: 'Test Team' });

      await teamService.create(newTeam);

      expect(mockPrismaClient.team.create).toHaveBeenCalledWith({
        data: { name: 'Test Team' },
      });
    });
  });

  describe('update', () => {
    test('deve atualizar equipe com sucesso', async () => {
      const updateData = { name: 'Updated Team Name' };
      const updatedTeam = { id: 1, ...updateData };
      mockPrismaClient.team.update.mockResolvedValue(updatedTeam);

      const result = await teamService.update(1, updateData);

      expect(mockPrismaClient.team.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { name: 'Updated Team Name' },
      });
      expect(result).toEqual(updatedTeam);
    });

    test('deve atualizar apenas o nome', async () => {
      const updateData = { name: 'New Name' };
      mockPrismaClient.team.update.mockResolvedValue({});

      await teamService.update(2, updateData);

      expect(mockPrismaClient.team.update).toHaveBeenCalledWith({
        where: { id: 2 },
        data: { name: 'New Name' },
      });
    });

    test('deve ignorar campos extras e atualizar apenas name', async () => {
      const updateData = { name: 'Team Name', extraField: 'ignored' };
      mockPrismaClient.team.update.mockResolvedValue({});

      await teamService.update(3, updateData);

      expect(mockPrismaClient.team.update).toHaveBeenCalledWith({
        where: { id: 3 },
        data: { name: 'Team Name' },
      });
    });
  });

  describe('removeMany', () => {
    test('deve remover múltiplas equipes', async () => {
      const idsToRemove = [1, 2, 3];
      mockPrismaClient.teamMember.deleteMany.mockResolvedValue({ count: 5 });
      mockPrismaClient.team.deleteMany.mockResolvedValue({ count: 3 });

      const result = await teamService.removeMany(idsToRemove);

      expect(mockPrismaClient.teamMember.deleteMany).toHaveBeenCalledWith({
        where: { teamId: { in: idsToRemove } },
      });
      expect(mockPrismaClient.team.deleteMany).toHaveBeenCalledWith({
        where: { id: { in: idsToRemove } },
      });
      expect(result).toEqual({ count: 3 });
    });

    test('deve remover membros antes de remover equipes', async () => {
  const idsToRemove = [1];
  mockPrismaClient.teamMember.deleteMany.mockResolvedValue({ count: 2 });
  mockPrismaClient.team.deleteMany.mockResolvedValue({ count: 1 });

  await teamService.removeMany(idsToRemove);

  const memberCallOrder = mockPrismaClient.teamMember.deleteMany.mock.invocationCallOrder[0];
  const teamCallOrder = mockPrismaClient.team.deleteMany.mock.invocationCallOrder[0];

  expect(memberCallOrder).toBeLessThan(teamCallOrder);
});


    test('deve remover uma única equipe', async () => {
      const idsToRemove = [1];
      mockPrismaClient.teamMember.deleteMany.mockResolvedValue({ count: 0 });
      mockPrismaClient.team.deleteMany.mockResolvedValue({ count: 1 });

      await teamService.removeMany(idsToRemove);

      expect(mockPrismaClient.team.deleteMany).toHaveBeenCalledWith({
        where: { id: { in: [1] } },
      });
    });

    test('deve funcionar com array vazio', async () => {
      mockPrismaClient.teamMember.deleteMany.mockResolvedValue({ count: 0 });
      mockPrismaClient.team.deleteMany.mockResolvedValue({ count: 0 });

      const result = await teamService.removeMany([]);

      expect(mockPrismaClient.teamMember.deleteMany).toHaveBeenCalledWith({
        where: { teamId: { in: [] } },
      });
      expect(mockPrismaClient.team.deleteMany).toHaveBeenCalledWith({
        where: { id: { in: [] } },
      });
      expect(result.count).toBe(0);
    });

    test('deve retornar count de equipes removidas', async () => {
      mockPrismaClient.teamMember.deleteMany.mockResolvedValue({ count: 10 });
      mockPrismaClient.team.deleteMany.mockResolvedValue({ count: 5 });

      const result = await teamService.removeMany([1, 2, 3, 4, 5]);

      expect(result.count).toBe(5);
    });
  });
});