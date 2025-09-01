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
			prefix: w.prefix,
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

	getById: async (id) => {
		return prisma.workspace.findUnique({
			where: { id: Number(id) },
			include: { steps: true },
		});
	},

	create: async ({ name, methodology, teamId, steps, prefix }) => {
		if (!CODE_REGEX.test(prefix || "")) {
			throw new Error("Código inválido: use apenas letras (1 a 5).");
		}

		console.log("steps", steps);
		const uniqueStepIds = new Set(steps.map((s) => s.stepId));
		if (uniqueStepIds.size !== steps.length) {
			throw new Error("Etapas duplicadas não são permitidas");
		}

		return prisma.workspace.create({
			data: {
				name,
				prefix: prefix.toUpperCase(),
				methodology,
				teamId,
				steps: {
					create: steps.map(({ stepId, order }) => ({ stepId, order })),
				},
			},
		});
	},

	update: async (id, { name, methodology, teamId, steps, prefix }) => {
		if (prefix != null && !CODE_REGEX.test(prefix || "")) {
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
				...(prefix != null ? { prefix: prefix.toUpperCase() } : {}),
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
