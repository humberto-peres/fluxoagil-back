const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function nextEpicKey(workspaceId) {
    return prisma.$transaction(async (tx) => {
        const ws = await tx.workspace.findUnique({ where: { id: workspaceId } });
        if (!ws) throw new Error("Workspace inválido");

        const seq = ws.nextEpicSeq || 1;
        const key = `${ws.key}-E${seq}`;

        await tx.workspace.update({
            where: { id: workspaceId },
            data: { nextEpicSeq: { increment: 1 } },
        });

        return key;
    });
}

module.exports = {
    getAll: async ({ workspaceId, status }) => {
        return prisma.epic.findMany({
            where: {
                ...(workspaceId ? { workspaceId: Number(workspaceId) } : {}),
                ...(status ? { status: String(status) } : {}),
            },
            include: { priority: true, _count: { select: { tasks: true } } },
            orderBy: { id: "desc" },
        });
    },

    getById: async (id) => {
        return prisma.epic.findUnique({
            where: { id: Number(id) },
            include: {
                priority: true,
                tasks: {
                    include: {
                        priority: true,
                        typeTask: true,
                        reporter: true,
                        assignee: true,
                        step: true,
                        sprint: true,
                        workspace: { select: { id: true, key: true } },
                    },
                    orderBy: { id: "desc" },
                },
            },
        });
    },


    create: async (data) => {
        const wsId = Number(data.workspaceId);
        const key = await nextEpicKey(wsId);

        return prisma.epic.create({
            data: {
                key,
                title: data.title,
                description: data.description ?? null,
                status: data.status ?? "open",
                startDate: data.startDate ? new Date(data.startDate) : null,
                targetDate: data.targetDate ? new Date(data.targetDate) : null,
                priorityId: data.priorityId ? Number(data.priorityId) : null,
                workspaceId: wsId,
            },
            include: { priority: true },
        });
    },

    update: async (id, data) => {
        return prisma.epic.update({
            where: { id: Number(id) },
            data: {
                title: data.title ?? undefined,
                description: data.description ?? undefined,
                status: data.status ?? undefined,
                startDate: data.startDate != null ? (data.startDate ? new Date(data.startDate) : null) : undefined,
                targetDate: data.targetDate != null ? (data.targetDate ? new Date(data.targetDate) : null) : undefined,
                priorityId: data.priorityId != null ? (data.priorityId ? Number(data.priorityId) : null) : undefined,
            },
            include: { priority: true },
        });
    },

    removeMany: async (ids) => {
        const epicIds = (ids || []).map(Number);
        if (!epicIds.length) return { count: 0 };

        const withTasks = await prisma.epic.findMany({
            where: { id: { in: epicIds } },
            select: { id: true, key: true, _count: { select: { tasks: true } } },
        });

        const blocked = withTasks.filter(e => e._count.tasks > 0);
        if (blocked.length) {
            const keys = blocked.map(b => b.key).join(", ");
            const err = new Error(`Não é possível excluir: ${keys} possuem atividades associadas.`);
            err.statusCode = 409;
            throw err;
        }

        return prisma.epic.deleteMany({ where: { id: { in: epicIds } } });
    },
};
