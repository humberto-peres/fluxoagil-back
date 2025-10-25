const mockPrismaClient = {
  user: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    deleteMany: jest.fn(),
  },
  task: {
    findMany: jest.fn(),
  },
  teamMember: {
    findMany: jest.fn(),
  },
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrismaClient),
}));

jest.mock('bcryptjs', () => ({
  hash: jest.fn((password) => Promise.resolve(`hashed_${password}`)),
}));

const bcrypt = require('bcryptjs');
const userService = require('../../../src/services/user.service');

describe('User Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    test('deve retornar todos os usuários com select público', async () => {
      const mockUsers = [
        { id: 1, name: 'João', email: 'joao@test.com', username: 'joao' },
        { id: 2, name: 'Maria', email: 'maria@test.com', username: 'maria' },
      ];
      mockPrismaClient.user.findMany.mockResolvedValue(mockUsers);

      const result = await userService.getAll();

      expect(mockPrismaClient.user.findMany).toHaveBeenCalledWith({
        select: expect.objectContaining({
          id: true,
          name: true,
          email: true,
          username: true,
          role: true,
          address: expect.any(Object),
        }),
      });
      expect(result).toEqual(mockUsers);
    });

    test('deve retornar array vazio quando não houver usuários', async () => {
      mockPrismaClient.user.findMany.mockResolvedValue([]);

      const result = await userService.getAll();

      expect(result).toEqual([]);
    });
  });

  describe('getById', () => {
    test('deve retornar usuário por id', async () => {
      const mockUser = { id: 1, name: 'João', email: 'joao@test.com' };
      mockPrismaClient.user.findUnique.mockResolvedValue(mockUser);

      const result = await userService.getById(1);

      expect(mockPrismaClient.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        select: expect.any(Object),
      });
      expect(result).toEqual(mockUser);
    });

    test('deve retornar null quando usuário não existir', async () => {
      mockPrismaClient.user.findUnique.mockResolvedValue(null);

      const result = await userService.getById(999);

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    test('deve criar usuário com sucesso', async () => {
      const newUser = {
        name: 'Carlos',
        email: 'carlos@test.com',
        username: 'carlos',
        password: 'senha123',
      };
      mockPrismaClient.user.create.mockResolvedValue({ id: 5, ...newUser });

      const result = await userService.create(newUser);

      expect(bcrypt.hash).toHaveBeenCalledWith('senha123', 10);

      expect(mockPrismaClient.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: 'Carlos',
          email: 'carlos@test.com',
          username: 'carlos',
        }),
        select: expect.any(Object),
      });

      expect(result).toHaveProperty('id', 5);
    });


    test('deve lançar erro quando senha tiver menos de 6 caracteres', async () => {
      const newUser = {
        name: 'Test',
        email: 'test@test.com',
        password: '12345',
      };

      await expect(userService.create(newUser)).rejects.toMatchObject({
        message: 'Senha obrigatória com no mínimo 6 caracteres.',
        status: 400,
      });
    });

    test('deve lançar erro quando senha não for fornecida', async () => {
      const newUser = {
        name: 'Test',
        email: 'test@test.com',
      };

      await expect(userService.create(newUser)).rejects.toMatchObject({
        message: 'Senha obrigatória com no mínimo 6 caracteres.',
        status: 400,
      });
    });

    test('deve criar usuário com endereço completo', async () => {
      const newUser = {
        name: 'João',
        email: 'joao@test.com',
        password: '123456',
        street: 'Rua A',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234-567',
        neighborhood: 'Centro',
        number: 100,
      };
      mockPrismaClient.user.create.mockResolvedValue({ id: 1 });

      await userService.create(newUser);

      expect(mockPrismaClient.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          address: {
            create: expect.objectContaining({
              street: 'Rua A',
              city: 'São Paulo',
              state: 'SP',
              zipCode: '01234-567',
              neighborhood: 'Centro',
              number: 100,
            }),
          },
        }),
        select: expect.any(Object),
      });
    });

    test('deve criar usuário sem endereço quando incompleto', async () => {
      const newUser = {
        name: 'Maria',
        email: 'maria@test.com',
        password: '123456',
        street: 'Rua B',
      };
      mockPrismaClient.user.create.mockResolvedValue({ id: 2 });

      await userService.create(newUser);

      expect(mockPrismaClient.user.create).toHaveBeenCalledWith({
        data: expect.not.objectContaining({
          address: expect.any(Object),
        }),
        select: expect.any(Object),
      });
    });

    test('deve aceitar cep como alternativa para zipCode', async () => {
      const newUser = {
        name: 'Ana',
        email: 'ana@test.com',
        password: '123456',
        street: 'Rua C',
        city: 'Rio',
        state: 'RJ',
        cep: '20000-000',
        neighborhood: 'Centro',
        number: 50,
      };
      mockPrismaClient.user.create.mockResolvedValue({ id: 3 });

      await userService.create(newUser);

      expect(mockPrismaClient.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          address: {
            create: expect.objectContaining({
              zipCode: '20000-000',
            }),
          },
        }),
        select: expect.any(Object),
      });
    });

    test('deve tratar erro de violação de unicidade (P2002)', async () => {
      const newUser = {
        name: 'Test',
        email: 'duplicate@test.com',
        password: '123456',
      };
      const prismaError = {
        code: 'P2002',
        meta: { target: ['email'] },
      };
      mockPrismaClient.user.create.mockRejectedValue(prismaError);

      await expect(userService.create(newUser)).rejects.toMatchObject({
        message: expect.stringContaining('Violação de unicidade'),
        status: 409,
      });
    });
  });

  describe('update', () => {
    test('deve atualizar usuário com sucesso', async () => {
      const updateData = { name: 'João Atualizado', email: 'joao.novo@test.com' };
      mockPrismaClient.user.update.mockResolvedValue({ id: 1, ...updateData });

      const result = await userService.update(1, updateData);

      expect(mockPrismaClient.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: expect.objectContaining({
          name: 'João Atualizado',
          email: 'joao.novo@test.com',
        }),
        select: expect.any(Object),
      });
      expect(result).toHaveProperty('id', 1);
    });

    test('deve atualizar senha quando fornecida', async () => {
      const updateData = { password: 'novaSenha123' };
      mockPrismaClient.user.update.mockResolvedValue({ id: 1 });

      await userService.update(1, updateData);

      expect(bcrypt.hash).toHaveBeenCalledWith('novaSenha123', 10);

      expect(mockPrismaClient.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 1 },
          data: expect.any(Object),
          select: expect.any(Object),
        })
      );
    });


    test('deve lançar erro quando senha tiver menos de 6 caracteres', async () => {
      const updateData = { password: '12345' };

      await expect(userService.update(1, updateData)).rejects.toMatchObject({
        message: 'Senha deve ter no mínimo 6 caracteres.',
        status: 400,
      });
    });

    test('não deve atualizar senha quando vazia ou apenas espaços', async () => {
      const updateData = { name: 'Test', password: '   ' };
      mockPrismaClient.user.update.mockResolvedValue({ id: 1 });

      await userService.update(1, updateData);

      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(mockPrismaClient.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: expect.not.objectContaining({
          password: expect.any(String),
        }),
        select: expect.any(Object),
      });
    });

    test('deve fazer upsert de endereço quando completo', async () => {
      const updateData = {
        name: 'Test',
        street: 'Rua Nova',
        city: 'Curitiba',
        state: 'PR',
        zipCode: '80000-000',
        neighborhood: 'Batel',
        number: 200,
      };
      mockPrismaClient.user.update.mockResolvedValue({ id: 1 });

      await userService.update(1, updateData);

      expect(mockPrismaClient.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: expect.objectContaining({
          address: {
            upsert: {
              create: expect.objectContaining({
                street: 'Rua Nova',
                city: 'Curitiba',
              }),
              update: expect.objectContaining({
                street: 'Rua Nova',
                city: 'Curitiba',
              }),
            },
          },
        }),
        select: expect.any(Object),
      });
    });

    test('não deve fazer upsert quando endereço incompleto', async () => {
      const updateData = {
        name: 'Test',
        street: 'Rua',
      };
      mockPrismaClient.user.update.mockResolvedValue({ id: 1 });

      await userService.update(1, updateData);

      expect(mockPrismaClient.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: expect.not.objectContaining({
          address: expect.any(Object),
        }),
        select: expect.any(Object),
      });
    });

    test('deve tratar erro de violação de unicidade', async () => {
      const updateData = { email: 'duplicate@test.com' };
      const prismaError = {
        code: 'P2002',
        meta: { target: ['email'] },
      };
      mockPrismaClient.user.update.mockRejectedValue(prismaError);

      await expect(userService.update(1, updateData)).rejects.toMatchObject({
        message: expect.stringContaining('Violação de unicidade'),
        status: 409,
      });
    });
  });

  describe('removeMany', () => {
    beforeEach(() => {
      mockPrismaClient.user.findMany.mockResolvedValue([]);
      mockPrismaClient.task.findMany.mockResolvedValue([]);
      mockPrismaClient.teamMember.findMany.mockResolvedValue([]);
    });

    test('deve remover múltiplos usuários com sucesso', async () => {
      const idsToRemove = [1, 2, 3];
      mockPrismaClient.user.deleteMany.mockResolvedValue({ count: 3 });

      const result = await userService.removeMany(idsToRemove);

      expect(mockPrismaClient.user.deleteMany).toHaveBeenCalledWith({
        where: { id: { in: [1, 2, 3] } },
      });
      expect(result.count).toBe(3);
    });

    test('deve impedir exclusão de administradores', async () => {
      mockPrismaClient.user.findMany.mockResolvedValue([
        { id: 1, name: 'Admin User' },
      ]);

      await expect(userService.removeMany([1, 2])).rejects.toMatchObject({
        message: 'Não é permitido excluir um administrador',
        status: 403,
      });

      expect(mockPrismaClient.user.deleteMany).not.toHaveBeenCalled();
    });

    test('deve impedir exclusão de usuários com tarefas como userId', async () => {
      mockPrismaClient.task.findMany.mockResolvedValue([
        { user: { id: 2, name: 'João' } },
      ]);

      await expect(userService.removeMany([2])).rejects.toMatchObject({
        message: expect.stringContaining('Usuários com tarefas associadas'),
        status: 400,
      });
    });

    test('deve impedir exclusão de usuários com tarefas como reporter', async () => {
      mockPrismaClient.task.findMany.mockResolvedValue([
        { reporter: { id: 3, name: 'Maria' } },
      ]);

      await expect(userService.removeMany([3])).rejects.toMatchObject({
        message: expect.stringContaining('Maria'),
        status: 400,
      });
    });

    test('deve impedir exclusão de usuários com tarefas como assignee', async () => {
      mockPrismaClient.task.findMany.mockResolvedValue([
        { assignee: { id: 4, name: 'Carlos' } },
      ]);

      await expect(userService.removeMany([4])).rejects.toMatchObject({
        message: expect.stringContaining('Carlos'),
        status: 400,
      });
    });

    test('deve impedir exclusão de usuários que são membros de equipes', async () => {
      mockPrismaClient.teamMember.findMany.mockResolvedValue([
        { user: { id: 5, name: 'Ana' } },
      ]);

      await expect(userService.removeMany([5])).rejects.toMatchObject({
        message: expect.stringContaining('membros de equipes'),
        status: 400,
      });
    });

    test('deve listar todos os usuários com tarefas na mensagem de erro', async () => {
      mockPrismaClient.task.findMany.mockResolvedValue([
        { user: { id: 1, name: 'João' } },
        { reporter: { id: 2, name: 'Maria' } },
        { assignee: { id: 1, name: 'João' } },
      ]);

      await expect(userService.removeMany([1, 2])).rejects.toMatchObject({
        message: expect.stringMatching(/João.*Maria/),
      });
    });

    test('deve converter ids para Number', async () => {
      mockPrismaClient.user.deleteMany.mockResolvedValue({ count: 2 });

      await userService.removeMany(['1', '2']);

      expect(mockPrismaClient.user.deleteMany).toHaveBeenCalledWith({
        where: { id: { in: [1, 2] } },
      });
    });
  });
});