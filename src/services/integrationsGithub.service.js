const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function assertCanManage(userId, workspaceId) {
	const can = await prisma.teamMember.findFirst({
		where: { team: { workspaces: { some: { id: workspaceId } } }, userId: Number(userId) },
	});
	if (!can) {
		const e = new Error('Sem acesso');
		e.status = 403;
		throw e;
	}
}

module.exports = {
	async getByWorkspace(userId, workspaceId) {
		await assertCanManage(userId, workspaceId);
		return prisma.integrationGithub.findFirst({ where: { workspaceId } });
	},

	async upsert(userId, { workspaceId, repoFullName, secret }) {
		await assertCanManage(userId, workspaceId);
		const existing = await prisma.integrationGithub.findFirst({ where: { workspaceId } });
		if (existing) {
			return prisma.integrationGithub.update({
				where: { id: existing.id },
				data: { repoFullName, secret },
			});
		}
		return prisma.integrationGithub.create({
			data: { workspaceId, repoFullName, secret, createdByUserId: Number(userId) },
		});
	},

	async listRules(userId, integrationId) {
		const integ = await prisma.integrationGithub.findUnique({ where: { id: integrationId } });
		await assertCanManage(userId, integ.workspaceId);
		return prisma.githubAutomationRule.findMany({ where: { integrationId } });
	},

	async createRule(userId, integrationId, { event, conditionsJson, actionJson, active = true }) {
		const integ = await prisma.integrationGithub.findUnique({ where: { id: integrationId } });
		await assertCanManage(userId, integ.workspaceId);
		return prisma.githubAutomationRule.create({
			data: { integrationId, event, conditionsJson, actionJson, active },
		});
	},

	async updateRule(userId, ruleId, patch) {
		const rule = await prisma.githubAutomationRule.findUnique({ where: { id: ruleId }, include: { integration: true } });
		await assertCanManage(userId, rule.integration.workspaceId);
		return prisma.githubAutomationRule.update({ where: { id: ruleId }, data: patch });
	},

	async deleteRule(userId, ruleId) {
		const rule = await prisma.githubAutomationRule.findUnique({ where: { id: ruleId }, include: { integration: true } });
		await assertCanManage(userId, rule.integration.workspaceId);
		await prisma.githubAutomationRule.delete({ where: { id: ruleId } });
		return { ok: true };
	},
};
