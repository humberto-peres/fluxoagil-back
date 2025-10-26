const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

module.exports = {
	async getAll(workspaceId) {
		if (workspaceId) {
			const workspaceSteps = await prisma.workspaceStep.findMany({
				where: { workspaceId },
				include: { step: true },
				orderBy: { order: 'asc' }
			});
			return workspaceSteps.map(ws => ws.step);
		}
		
		return prisma.step.findMany();
	},

	getById: (id) => prisma.step.findUnique({ where: { id } }),

	create: (data) => prisma.step.create({ data }),

	update: (id, data) =>
		prisma.step.update({
			where: { id },
			data,
		}),

	removeMany: async (ids) => {
		return prisma.step.deleteMany({
			where: {
				id: {
					in: ids,
				},
			},
		});
	},
};
