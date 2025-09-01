const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

module.exports = {
	getAll: () => prisma.step.findMany(),

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
