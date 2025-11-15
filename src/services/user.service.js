const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

const userSelectPublic = {
  id: true,
  name: true,
  email: true,
  username: true,
  role: true,
  address: {
    select: {
      id: true,
      street: true,
      city: true,
      state: true,
      zipCode: true,
      neighborhood: true,
      number: true,
    },
  },
};

function splitAndNormalize(data = {}) {
  const {
    name,
    email,
    username,
    password,
    role,
    cep    
  } = data;

  const {
    zipCode,
    state,
    city,
    street,
    neighborhood,
    number
  } = data.address;

  const userData = {
    name,
    email,
    username,
    password,
    role,
  };

  const addressData = {
    street,
    city,
    state,
    neighborhood,
    zipCode: zipCode || cep,
    number: number != null ? Number(number) : undefined,
  };

  return { userData, addressData };
}

function isAddressComplete(addr) {
  if (!addr) return false;
  const required = ["street", "city", "state", "zipCode", "neighborhood", "number"];
  return required.every((k) => addr[k] !== undefined && addr[k] !== null && addr[k] !== "");
}

function mapPrismaError(err) {
  if (err?.code === "P2002") {
    const fields = Array.isArray(err.meta?.target) ? err.meta.target.join(", ") : String(err.meta?.target || "");
    const e = new Error(`Violação de unicidade em: ${fields || "campo único"}.`);
    e.status = 409;
    return e;
  }
  return err;
}

module.exports = {
  async getAll() {
    return prisma.user.findMany({ select: userSelectPublic });
  },

  async getById(id) {
    return prisma.user.findUnique({
      where: { id },
      select: userSelectPublic,
    });
  },

  async create(data) {
    const { userData, addressData } = splitAndNormalize(data);

    if (!userData.password || String(userData.password).length < 6) {
      const e = new Error("Senha obrigatória com no mínimo 6 caracteres.");
      e.status = 400;
      throw e;
    }

    const passwordHash = await bcrypt.hash(String(userData.password), 10);

    const createData = {
      name: userData.name,
      email: userData.email,
      username: userData.username,
      role: userData.role,
      password: passwordHash,
    };

    if (addressData) {
      createData.address = { create: addressData };
    } 

    try {
      return await prisma.user.create({
        data: createData,
        select: userSelectPublic,
      });
    } catch (err) {
      throw mapPrismaError(err);
    }
  },

  async update(id, data) {
    const { userData, addressData } = splitAndNormalize(data);

    const toUpdate = {
      name: userData.name,
      email: userData.email,
      username: userData.username,
      role: userData.role,
    };

    if (typeof userData.password === "string" && userData.password.trim() !== "") {
      if (userData.password.length < 6) {
        const e = new Error("Senha deve ter no mínimo 6 caracteres.");
        e.status = 400;
        throw e;
      }
      toUpdate.password = await bcrypt.hash(String(userData.password), 10);
    }

    const addressMutation = isAddressComplete(addressData)
      ? {
          address: {
            upsert: {
              create: addressData,
              update: addressData,
            },
          },
        }
      : {};
    try {
      return await prisma.user.update({
        where: { id },
        data: {
          ...toUpdate,
          ...addressMutation,
        },
        select: userSelectPublic,
      });
    } catch (err) {
      throw mapPrismaError(err);
    }
  },

  async removeMany(ids) {
    const userIds = ids.map(Number);
    
    const admins = await prisma.user.findMany({
      where: {
        id: { in: userIds },
        role: "admin",
      },
      select: { id: true, name: true },
    });

    if (admins.length > 0) {
      const e = new Error(`Não é permitido excluir um administrador`);
      e.status = 403;
      throw e;
    }

    const usersWithTasks = await prisma.task.findMany({
      where: {
        OR: [
          { userId: { in: userIds } },
          { reporterId: { in: userIds } },
          { assigneeId: { in: userIds } },
        ],
      },
      select: {
        user: { select: { id: true, name: true } },
        reporter: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true } },
      },
    });

    if (usersWithTasks.length > 0) {
      const userNames = new Set();
      usersWithTasks.forEach((task) => {
        if (task.user && userIds.includes(task.user.id)) userNames.add(task.user.name);
        if (task.reporter && userIds.includes(task.reporter.id)) userNames.add(task.reporter.name);
        if (task.assignee && userIds.includes(task.assignee.id)) userNames.add(task.assignee.name);
      });

      const e = new Error(`Usuários com tarefas associadas não podem ser excluídos: ${Array.from(userNames).join(", ")}`);
      e.status = 400;
      throw e;
    }

    const usersInTeams = await prisma.teamMember.findMany({
      where: { userId: { in: userIds } },
      include: {
        user: { select: { id: true, name: true } },
      },
    });

    if (usersInTeams.length > 0) {
      const userNames = [...new Set(usersInTeams.map((tm) => tm.user.name))].join(", ");
      const e = new Error(`Usuários que são membros de equipes não podem ser excluídos: ${userNames}`);
      e.status = 400;
      throw e;
    }

    return prisma.user.deleteMany({
      where: { id: { in: userIds } },
    });
  },
};
