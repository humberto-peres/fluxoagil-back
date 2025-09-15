const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { parseDateInput } = require('../utils/datetime');

async function ensureWorkspaceExists(workspaceId) {
  const ws = await prisma.workspace.findUnique({ where: { id: Number(workspaceId) } });
  if (!ws) throw new Error('Workspace inexistente');
  return ws;
}

module.exports = {
  getAll: async ({ workspaceId, isActive } = {}) => {
    return prisma.sprint.findMany({
      where: {
        workspaceId: workspaceId ? Number(workspaceId) : undefined,
        isActive: typeof isActive === 'boolean' ? isActive : undefined,
      },
      orderBy: [{ isActive: 'desc' }, { startDate: 'desc' }, { id: 'desc' }],
    });
  },

  getById: async (id) => {
    return prisma.sprint.findUnique({ where: { id: Number(id) } });
  },

  create: async (data) => {
    await ensureWorkspaceExists(data.workspaceId);

    const payload = {
      name: data.name,
      workspaceId: Number(data.workspaceId),
      startDate: data.startDate ? parseDateInput(data.startDate) : null,
      endDate: data.endDate ? parseDateInput(data.endDate) : null,
      isActive: Boolean(data.isActive),
    };

    if (payload.isActive) {
      if (!payload.startDate || !payload.endDate) {
        throw new Error('Para ativar na criação, defina início e término.');
      }
      await prisma.sprint.updateMany({
        where: { workspaceId: payload.workspaceId, isActive: true },
        data: { isActive: false },
      });
    }

    return prisma.sprint.create({ data: payload });
  },

  update: async (id, data) => {
    const current = await prisma.sprint.findUnique({ where: { id: Number(id) } });
    if (!current) throw new Error('Sprint inexistente');

    const patch = {
      name: data.name ?? undefined,
      startDate: data.startDate === undefined ? undefined : (data.startDate ? parseDateInput(data.startDate) : null),
      endDate: data.endDate === undefined ? undefined : (data.endDate ? parseDateInput(data.endDate) : null),
      isActive: data.isActive === undefined ? undefined : Boolean(data.isActive),
    };

    if (patch.isActive === true) {
      const start = patch.startDate ?? current.startDate;
      const end = patch.endDate ?? current.endDate;
      if (!start || !end) throw new Error('Para ativar, defina início e término.');
      await prisma.sprint.updateMany({
        where: { workspaceId: current.workspaceId, isActive: true, NOT: { id: current.id } },
        data: { isActive: false },
      });
    }

    return prisma.sprint.update({ where: { id: Number(id) }, data: patch });
  },

  removeMany: async (ids) => {
    return prisma.sprint.deleteMany({ where: { id: { in: ids.map(Number) } } });
  },

  activate: async (id) => {
    const s = await prisma.sprint.findUnique({ where: { id: Number(id) } });
    if (!s) throw new Error('Sprint inexistente');
    if (!s.startDate || !s.endDate) throw new Error('Defina início e término antes de ativar.');

    await prisma.sprint.updateMany({
      where: { workspaceId: s.workspaceId, isActive: true, NOT: { id: s.id } },
      data: { isActive: false },
    });

    return prisma.sprint.update({ where: { id: s.id }, data: { isActive: true } });
  },

  close: async (id) => {
    const s = await prisma.sprint.findUnique({ where: { id: Number(id) } });
    if (!s) throw new Error('Sprint inexistente');
    const end = s.endDate ?? new Date();
    return prisma.sprint.update({ where: { id: s.id }, data: { isActive: false, endDate: end } });
  },
};
