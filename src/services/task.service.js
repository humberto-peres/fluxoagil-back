const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { parseDateInput } = require("../utils/datetime");

async function ensureStepInWorkspace(stepId, workspaceId) {
  const link = await prisma.workspaceStep.findFirst({
    where: { stepId: Number(stepId), workspaceId: Number(workspaceId) },
    select: { id: true },
  });
  if (!link) throw new Error("A etapa informada não pertence ao workspace.");
}

async function ensureEpicInWorkspace(epicId, workspaceId) {
  if (!epicId) return;
  const epic = await prisma.epic.findUnique({
    where: { id: Number(epicId) },
    select: { id: true, workspaceId: true },
  });
  if (!epic) throw new Error("Épico inexistente.");
  if (epic.workspaceId !== Number(workspaceId)) {
    throw new Error("O épico informado pertence a outro workspace.");
  }
}

module.exports = {
  getAllTasks: async (userId) => {
    return prisma.task.findMany({
      where: {
        workspace: {
          team: {
            members: {
              some: { userId: Number(userId) }
            }
          }
        }
      },
      include: {
        priority: true,
        typeTask: true,
        reporter: true,
        assignee: true,
        step: true,
        sprint: { select: { id: true, workspaceId: true } },
        workspace: { select: { id: true, key: true } },
        epic: { select: { id: true, key: true, title: true } },
      },
      orderBy: { id: "asc" },
    });
  },

  getTasks: async ({ workspaceId, stepId, sprintId }) => {
    return prisma.task.findMany({
      where: {
        workspaceId: workspaceId ? Number(workspaceId) : undefined,
        stepId: stepId ? Number(stepId) : undefined,
        sprintId:
          sprintId !== undefined ? (sprintId === null ? null : Number(sprintId)) : undefined,
      },
      include: {
        priority: true,
        typeTask: true,
        reporter: true,
        assignee: true,
        step: true,
        sprint: { select: { id: true, workspaceId: true } },
        workspace: { select: { id: true, key: true } },
        epic: { select: { id: true, key: true, title: true } },
      },
      orderBy: { id: "desc" },
    });
  },

  getById: async (id) => {
    return prisma.task.findUnique({
      where: { id: Number(id) },
      include: {
        priority: true,
        typeTask: true,
        reporter: true,
        assignee: true,
        step: true,
        sprint: { select: { id: true, workspaceId: true, name: true } },
        workspace: { select: { id: true, key: true } },
        epic: { select: { id: true, key: true, title: true } },
      },
    });
  },

  create: async (data) => {
    if (!data.workspaceId) throw new Error("workspaceId é obrigatório.");
    const workspaceId = Number(data.workspaceId);
    const stepId = Number(data.stepId);

    if (data.sprintId) {
      const sprint = await prisma.sprint.findUnique({
        where: { id: Number(data.sprintId) },
        select: { id: true, workspaceId: true },
      });
      if (!sprint) throw new Error("Sprint inexistente.");
      if (sprint.workspaceId !== workspaceId) {
        throw new Error("workspaceId difere do workspace da sprint.");
      }
    }

    await ensureStepInWorkspace(stepId, workspaceId);
    await ensureEpicInWorkspace(data.epicId, workspaceId);

    const result = await prisma.$transaction(async (tx) => {
      const ws = await tx.workspace.update({
        where: { id: workspaceId },
        data: { nextTaskSeq: { increment: 1 } },
        select: { nextTaskSeq: true, key: true },
      });

      const payload = {
        title: data.title,
        description: data.description ?? null,
        estimate: data.estimate ?? null,
        startDate: parseDateInput(data.startDate),
        deadline: parseDateInput(data.deadline),
        sprintId: data.sprintId ? Number(data.sprintId) : null,
        stepId,
        priorityId: Number(data.priorityId),
        typeTaskId: Number(data.typeTaskId),
        reporterId: data.reporterId ? Number(data.reporterId) : null,
        assigneeId: data.assigneeId ? Number(data.assigneeId) : null,
        userId: Number(data.userId),
        status: data.status ?? String(stepId),
        workspaceId,
        idTask: `${ws.key}-${ws.nextTaskSeq}`,
        epicId: data.epicId ? Number(data.epicId) : null,
      };

      const created = await tx.task.create({ data: payload });
      return created.id;
    });

    return module.exports.getById(result);
  },

  update: async (id, data) => {
    const current = await prisma.task.findUnique({
      where: { id: Number(id) },
      select: { id: true, stepId: true, sprintId: true, workspaceId: true },
    });
    if (!current) throw new Error("Tarefa inexistente.");

    const nextWorkspaceId =
      data.workspaceId != null ? Number(data.workspaceId) : current.workspaceId;
    const nextStepId = data.stepId != null ? Number(data.stepId) : current.stepId;
    const nextSprintId =
      data.sprintId !== undefined ? (data.sprintId === null ? null : Number(data.sprintId)) : current.sprintId;

    if (nextSprintId) {
      const sprint = await prisma.sprint.findUnique({
        where: { id: nextSprintId },
        select: { id: true, workspaceId: true },
      });
      if (!sprint) throw new Error("Sprint inexistente.");
      if (sprint.workspaceId !== nextWorkspaceId) {
        throw new Error("workspaceId difere do workspace da sprint.");
      }
    }

    await ensureStepInWorkspace(nextStepId, nextWorkspaceId);
    await ensureEpicInWorkspace(data.epicId ?? null, nextWorkspaceId);

    const patch = {
      title: data.title ?? undefined,
      description: data.description ?? undefined,
      estimate: data.estimate ?? undefined,
      startDate: data.startDate !== undefined ? parseDateInput(data.startDate) : undefined,
      deadline: data.deadline !== undefined ? parseDateInput(data.deadline) : undefined,
      sprintId: data.sprintId !== undefined ? nextSprintId : undefined,
      stepId: data.stepId != null ? nextStepId : undefined,
      priorityId: data.priorityId != null ? Number(data.priorityId) : undefined,
      typeTaskId: data.typeTaskId != null ? Number(data.typeTaskId) : undefined,
      reporterId:
        data.reporterId !== undefined ? (data.reporterId ? Number(data.reporterId) : null) : undefined,
      assigneeId:
        data.assigneeId !== undefined ? (data.assigneeId ? Number(data.assigneeId) : null) : undefined,
      userId: data.userId != null ? Number(data.userId) : undefined,
      status: data.status ?? undefined,
      workspaceId: data.workspaceId != null ? nextWorkspaceId : undefined,
      epicId: data.epicId !== undefined ? (data.epicId ? Number(data.epicId) : null) : undefined,
    };

    await prisma.task.update({ where: { id: Number(id) }, data: patch });
    return module.exports.getById(id);
  },

  removeMany: async (ids) => {
    const taskIds = (ids || []).map(Number);
    if (!taskIds.length) return { count: 0 };

    const withEpic = await prisma.task.findMany({
      where: { id: { in: taskIds }, epicId: { not: null } },
      select: { id: true, idTask: true, epicId: true },
    });

    if (withEpic.length) {
      const keys = withEpic.map(t => t.idTask).join(', ');
      const err = new Error(`Não é possível excluir: ${keys} estão vinculadas a um épico.`);
      err.statusCode = 409;
      throw err;
    }

    return prisma.task.deleteMany({ where: { id: { in: taskIds } } });
  },

  move: async (id, stepId) => {
    const task = await prisma.task.findUnique({
      where: { id: Number(id) },
      select: { workspaceId: true },
    });
    if (!task) throw new Error("Tarefa inexistente.");
    await ensureStepInWorkspace(stepId, task.workspaceId);

    return prisma.task.update({
      where: { id: Number(id) },
      data: { stepId: Number(stepId), status: String(stepId) },
    });
  },
};
