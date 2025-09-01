const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

module.exports = {
	getAll: () =>
		prisma.team.findMany({
			select: {
				id: true,
				name: true,
				members: {
					select: { user: true },
				},
			},
		}),

	getById: (id) =>
		prisma.team.findUnique({
			where: { id },
			include: {
				members: {
					include: { user: true },
				},
			},
		}),

	create: ({ name }) =>
		prisma.team.create({
			data: { name }
		}),

	update: (id, { name }) =>
		prisma.team.update({
			where: { id },
			data: { name },
		}),

	removeMany: async (ids) => {
		await prisma.teamMember.deleteMany({
			where: {
				teamId: { in: ids },
			},
		});

		return prisma.team.deleteMany({
			where: {
				id: { in: ids },
			},
		});
	},
};
