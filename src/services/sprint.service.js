const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { parseDateInput } = require('../utils/datetime');

function isClosed(s) { return !s.isActive && !!s.closedAt; }
async function ensureWorkspaceExists(workspaceId) {
  const ws = await prisma.workspace.findUnique({ where: { id: Number(workspaceId) } });
  if (!ws) throw new Error('Workspace inexistente');
  return ws;
}

async function getFinalStepId(workspaceId) {
  const steps = await prisma.workspaceStep.findMany({
    where: { workspaceId: Number(workspaceId) },
    orderBy: { order: 'asc' },
    select: { stepId: true },
  });
  return steps.length ? steps[steps.length - 1].stepId : null;
}

async function getAll({ workspaceId, state, isActive } = {}) {
  const where = { workspaceId: workspaceId ? Number(workspaceId) : undefined };
  
  /**
   * Classificação baseada somente em closedAt:
   * - closed:   closedAt != null (encerrada via ação do usuário)
   * - open:     closedAt == null  (independe de endDate / isActive)
   * - active:   isActive == true  (uma sprint pode estar ativa e ainda não "fechada")
   * - planned:  isActive == false && closedAt == null
   */
  if (state) {
    if (state === 'active') {
      where.isActive = true;
      where.closedAt = { equals: null };
    } else if (state === 'planned') {
      where.isActive = false;
      where.closedAt = { equals: null };
    } else if (state === 'closed') {
      where.closedAt = { not: null };
    } else if (state === 'open') {
      where.closedAt = { equals: null };
    } else {
      where.closedAt = { equals: null };
    }
  } else if (typeof isActive === 'boolean') {
    where.isActive = isActive;
  } else {
    where.closedAt = { equals: null };
  }

  return prisma.sprint.findMany({
    where,
    orderBy: [
      { isActive: 'desc' },
      { activatedAt: 'desc' },
      { startDate: 'desc' },
      { id: 'desc' }
    ],
  });
}

async function getById(id) {
  return prisma.sprint.findUnique({ where: { id: Number(id) } });
}

async function create(data) {
  await ensureWorkspaceExists(data.workspaceId);
  const payload = {
    name: data.name,
    workspaceId: Number(data.workspaceId),
    startDate: data.startDate ? parseDateInput(data.startDate) : null,
    endDate: data.endDate ? parseDateInput(data.endDate) : null,
    isActive: Boolean(data.isActive),
    activatedAt: null,
    closedAt: null,
  };

  if (payload.isActive) {
    if (!payload.startDate || !payload.endDate) {
      throw new Error('Para ativar na criação, defina início e término.');
    }
    payload.activatedAt = data.activatedAt ? parseDateInput(data.activatedAt) : new Date();
  }

  return prisma.sprint.create({ data: payload });
}

async function update(id, data) {
  const current = await prisma.sprint.findUnique({ where: { id: Number(id) } });
  if (!current) throw new Error('Sprint inexistente');

  const patch = {
    name: data.name ?? undefined,
    startDate: data.startDate === undefined ? undefined : (data.startDate ? parseDateInput(data.startDate) : null),
    endDate: data.endDate === undefined ? undefined : (data.endDate ? parseDateInput(data.endDate) : null),
    isActive: data.isActive === undefined ? undefined : Boolean(data.isActive),
  };

  if (patch.isActive === true && isClosed(current)) {
    throw new Error('Sprint encerrada não pode ser reativada.');
  }

  if (patch.isActive === true) {
    const start = patch.startDate ?? current.startDate;
    const end = patch.endDate ?? current.endDate;
    if (!start || !end) throw new Error('Para ativar, defina início e término.');
    if (!current.activatedAt) {
      Object.assign(patch, { activatedAt: new Date() });
    }
  }

  return prisma.sprint.update({ where: { id: Number(id) }, data: patch });
}

async function removeMany(ids) {
  return prisma.sprint.deleteMany({ where: { id: { in: ids.map(Number) } } });
}

async function activate(id) {
  const s = await prisma.sprint.findUnique({ where: { id: Number(id) } });
  if (!s) throw new Error('Sprint inexistente');
  if (isClosed(s)) throw new Error('Sprint encerrada não pode ser reativada.');
  if (!s.startDate || !s.endDate) throw new Error('Defina início e término antes de ativar.');
  return prisma.sprint.update({
    where: { id: s.id },
    data: { isActive: true, activatedAt: s.activatedAt ?? new Date() },
  });
}

async function close(id, opts = {}) {
  const s = await prisma.sprint.findUnique({ where: { id: Number(id) } });
  if (!s) throw new Error('Sprint inexistente');

  const now = new Date();
  const end = s.endDate ?? now;

  const finalStepId = await getFinalStepId(s.workspaceId);

  const moveWhere = {
    sprintId: s.id,
    ...(finalStepId ? { NOT: { stepId: finalStepId } } : {}),
  };

  let movedCount = 0;
  const move = opts.move || {};
  if (move.to === 'sprint') {
    const tgt = await prisma.sprint.findUnique({ where: { id: Number(move.sprintId) } });
    if (!tgt || tgt.workspaceId !== s.workspaceId) {
      throw new Error('Sprint de destino inválida (diferente do workspace).');
    }
    if (tgt.closedAt) throw new Error('Sprint de destino está encerrada.');

    const res = await prisma.task.updateMany({
      where: moveWhere,
      data: { sprintId: tgt.id },
    });
    movedCount = res.count;
  } else {
    const res = await prisma.task.updateMany({
      where: moveWhere,
      data: { sprintId: null },
    });
    movedCount = res.count;
  }

  const updated = await prisma.sprint.update({
    where: { id: s.id },
    data: { isActive: false, endDate: end, closedAt: s.closedAt ?? now },
  });

  return { sprint: updated, movedCount };
}

module.exports = { getAll, getById, create, update, removeMany, activate, close };
