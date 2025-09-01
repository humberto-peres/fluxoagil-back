const service = require('../services/teamMember.service');

module.exports = {
	async getMembers(req, res) {
		const { teamId } = req.params;
		try {
			const members = await service.getMembersByTeam(Number(teamId));
			res.json(members);
		} catch (error) {
			res.status(500).json({ message: 'Erro ao buscar membros', error });
		}
	},

	async getAvailableUsers(req, res) {
		const { teamId } = req.params;
		try {
			const users = await service.getAvailableUsers(Number(teamId));
			res.json(users);
		} catch (error) {
			res.status(500).json({ message: 'Erro ao buscar usuários disponíveis', error });
		}
	},

	async addMembers(req, res) {
		const { teamId } = req.params;
		const { userIds } = req.body;
		try {
			const result = await service.addMembers(Number(teamId), userIds);
			res.status(201).json(result);
		} catch (error) {
			res.status(500).json({ message: 'Erro ao adicionar membros', error });
		}
	},

	async removeMember(req, res) {
		const { teamId, userId } = req.params;
		try {
			await service.removeMember(Number(teamId), Number(userId));
			res.json({ message: 'Membro removido com sucesso' });
		} catch (error) {
			res.status(500).json({ message: 'Erro ao remover membro', error });
		}
	}
};
