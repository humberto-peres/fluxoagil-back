const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = {
	getMembersByTeam: async (teamId) => {
		return prisma.teamMember.findMany({
			where: { teamId },
			include: { user: true }
		});
	},

	addMembers: async (teamId, userIds) => {
		return prisma.teamMember.createMany({
			data: userIds.map(userId => ({ userId, teamId })),
			skipDuplicates: true
		});
	},

	removeMember: async (teamId, userId) => {
		return prisma.teamMember.deleteMany({
			where: { teamId, userId }
		});
	},

	getAvailableUsers: async (teamId) => {
		const memberUserIds = await prisma.teamMember.findMany({
			where: { teamId },
			select: { userId: true }
		});

		const idsToExclude = memberUserIds.map(m => m.userId);

		return prisma.user.findMany({
			where: {
				id: {
					notIn: idsToExclude.length > 0 ? idsToExclude : [0]
				}
			},
			select: {
				id: true,
				name: true
			}
		});
	}
};
