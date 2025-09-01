const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

module.exports = {
	getAll: async () => {
		return prisma.priority.findMany();
	},

	getById: async (id) => {
		return prisma.priority.findUnique({ where: { id } });
	},

	create: async (data) => {
		return prisma.priority.create({ data });
	},

	update: async (id, data) => {
		return prisma.priority.update({ where: { id }, data });
	},

	removeMany: async (ids) => {
		return prisma.priority.deleteMany({
			where: { id: { in: ids } },
		});
	},
};
