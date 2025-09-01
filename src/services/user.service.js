const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

module.exports = {
	getAll: () =>
		prisma.user.findMany({
			include: { address: true },
		}),

	getById: (id) => prisma.user.findUnique({ where: { id } }),

	create: (data) => prisma.user.create({ data }),

	update: (id, data) => prisma.user.update({ where: { id }, data }),

	removeMany: async (ids) => {
		return prisma.user.deleteMany({
			where: {
				id: { in: ids },
			},
		});
	},
};
