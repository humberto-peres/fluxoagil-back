const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function isDone(stepName) {
  if (!stepName) return false;
  return /done|feito|conclu[íi]do?/i.test(stepName);
}

function isOverdue(deadline) {
  if (!deadline) return false;
  const now = new Date();
  return new Date(deadline) < now;
}

function isUpcoming(deadline) {
  if (!deadline) return false;
  const now = new Date();
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const deadlineDate = new Date(deadline);
  return deadlineDate >= now && deadlineDate <= sevenDaysFromNow;
}

module.exports = {
  async getDashboardData(workspaceId, userId) {
    const tasks = await prisma.task.findMany({
      where: { workspaceId },
      include: {
        priority: true,
        typeTask: true,
        step: true,
        assignee: { select: { id: true, name: true } },
        reporter: { select: { id: true, name: true } },
        sprint: { select: { id: true, name: true } },
        epic: { select: { id: true, key: true, title: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const activeSprint = await prisma.sprint.findFirst({
      where: { workspaceId, isActive: true },
      select: {
        id: true,
        name: true,
        startDate: true,
        endDate: true,
        activatedAt: true,
      },
    });

    const epics = await prisma.epic.findMany({
      where: { workspaceId },
      include: {
        _count: { select: { tasks: true } },
        tasks: {
          include: { step: true },
        },
      },
      orderBy: { id: 'desc' },
      take: 10,
    });

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => isDone(t.step.name)).length;
    const overdueTasks = tasks.filter(t => !isDone(t.step.name) && isOverdue(t.deadline)).length;
    const upcomingTasks = tasks.filter(t => !isDone(t.step.name) && isUpcoming(t.deadline)).length;

    const myTasks = tasks
      .filter(t => t.assigneeId === userId)
      .sort((a, b) => {
        if (a.deadline && b.deadline) {
          return new Date(a.deadline) - new Date(b.deadline);
        }
        if (a.deadline) return -1;
        if (b.deadline) return 1;
        return 0;
      })
      .slice(0, 10)
      .map(t => ({
        id: t.id,
        idTask: t.idTask,
        title: t.title,
        status: t.step.name,
        priority: t.priority ? { name: t.priority.name, label: t.priority.label } : null,
        deadline: t.deadline,
        epicKey: t.epic?.key,
      }));

    const statusMap = new Map();
    tasks.forEach(t => {
      const status = t.step.name;
      statusMap.set(status, (statusMap.get(status) || 0) + 1);
    });
    const tasksByStatus = Array.from(statusMap, ([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    const priorityMap = new Map();
    tasks.forEach(t => {
      const name = t.priority?.name || 'Sem prioridade';
      const label = t.priority?.label;
      const current = priorityMap.get(name) || { name, label, count: 0 };
      current.count += 1;
      priorityMap.set(name, current);
    });
    const tasksByPriority = Array.from(priorityMap.values())
      .sort((a, b) => b.count - a.count);

    const typeMap = new Map();
    tasks.forEach(t => {
      const name = t.typeTask?.name || 'Sem tipo';
      typeMap.set(name, (typeMap.get(name) || 0) + 1);
    });
    const tasksByType = Array.from(typeMap, ([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    const epicProgress = epics.map(e => {
      const total = e._count.tasks;
      const done = e.tasks.filter(t => isDone(t.step.name)).length;
      const pct = total > 0 ? Math.round((done / total) * 100) : 0;
      return {
        id: e.id,
        key: e.key,
        title: e.title,
        total,
        done,
        pct,
      };
    }).sort((a, b) => b.pct - a.pct);

    const recentActivity = tasks
      .slice(0, 10)
      .map(t => ({
        id: t.id,
        idTask: t.idTask,
        title: t.title,
        status: t.step.name,
        assignee: t.assignee?.name,
        updatedAt: t.updatedAt,
      }));

    return {
      totalTasks,
      completedTasks,
      overdueTasks,
      upcomingTasks,
      activeSprint,
      myTasks,
      tasksByStatus,
      tasksByPriority,
      tasksByType,
      epicProgress,
      recentActivity,
    };
  },
};