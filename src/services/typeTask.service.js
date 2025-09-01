const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = {
	getAll: async () => {
		return prisma.typeTask.findMany();
	},

	getById: async (id) => {
		return prisma.typeTask.findUnique({
			where: { id: Number(id) },
		});
	},

	create: async (data) => {
		return prisma.typeTask.create({
			data,
		});
	},

	update: async (id, data) => {
		return prisma.typeTask.update({
			where: { id: Number(id) },
			data,
		});
	},

	deleteMany: async (ids) => {
		return prisma.typeTask.deleteMany({
			where: { id: { in: ids } },
		});
	}
};
