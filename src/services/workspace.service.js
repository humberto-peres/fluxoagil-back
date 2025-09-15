const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const CODE_REGEX = /^[A-Za-z]{1,5}$/;

module.exports = {
	getAll: async () => {
		const data = await prisma.workspace.findMany({
			include: {
				steps: { include: { step: true }, orderBy: { order: "asc" } },
				team: { include: { members: { include: { user: true } } } },
			},
		});

		return data.map((w) => ({
			id: w.id,
			name: w.name,
			key: w.key,
			methodology: w.methodology,
			teamId: w.teamId,
			teamName: w.team?.name || "",
			members: w.team?.members.map((tm) => tm.user.name) || [],
			steps: w.steps.map((s) => ({
				stepId: s.stepId,
				name: s.step.name,
				order: s.order,
			})),
		}));
	},

	getAllowedForUser: async (userId) => {
		const data = await prisma.workspace.findMany({
			where: {
				team: {
					members: {
						some: { userId: Number(userId) },
					},
				},
			},
			select: {
				id: true,
				name: true,
				methodology: true,
				key: true,
			},
			orderBy: { name: 'asc' },
		});
		return data;
	},

	async canAccess(userId, workspaceId) {
		const ws = await prisma.workspace.findFirst({
			where: {
				id: Number(workspaceId),
				team: { members: { some: { userId: Number(userId) } } },
			},
			select: { id: true },
		});
		return !!ws;
	},

	getById: async (id) => {
		return prisma.workspace.findUnique({
			where: { id: Number(id) },
			include: {
				steps: {
					include: { step: true },
					orderBy: { order: "asc" },
				},
			},
		});
	},

	create: async ({ name, methodology, teamId, steps, key }) => {
		if (!CODE_REGEX.test(key || "")) {
			throw new Error("Código inválido: use apenas letras (1 a 5).");
		}

		const uniqueStepIds = new Set(steps.map((s) => s.stepId));
		if (uniqueStepIds.size !== steps.length) {
			throw new Error("Etapas duplicadas não são permitidas");
		}

		return prisma.workspace.create({
			data: {
				name,
				key: key.toUpperCase(),
				methodology,
				teamId,
				steps: {
					create: steps.map(({ stepId, order }) => ({ stepId, order })),
				},
			},
		});
	},

	update: async (id, { name, methodology, teamId, steps, key }) => {
		if (key != null && !CODE_REGEX.test(key || "")) {
			throw new Error("Código inválido: use apenas letras (1 a 5).");
		}

		const uniqueStepIds = new Set(steps.map((s) => s.stepId));
		if (uniqueStepIds.size !== steps.length) {
			throw new Error("Etapas duplicadas não são permitidas");
		}

		await prisma.workspaceStep.deleteMany({ where: { workspaceId: id } });

		return prisma.workspace.update({
			where: { id },
			data: {
				name,
				methodology,
				teamId,
				...(key != null ? { key: key.toUpperCase() } : {}),
				steps: {
					create: steps.map(({ stepId, order }) => ({ stepId, order })),
				},
			},
		});
	},

	deleteMany: async (ids) => {
		return prisma.workspace.deleteMany({ where: { id: { in: ids } } });
	},
};
