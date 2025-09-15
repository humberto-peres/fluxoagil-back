const service = require('../services/workspace.service');

module.exports = {
	async getAll(req, res) {
		try {
			const data = await service.getAll();
			res.json(data);
		} catch (error) {
			res.status(500).json({ message: 'Erro ao buscar workspaces', error });
		}
	},

	async getAllowedForUser(req, res) {
		try {
			const data = await service.getAllowedForUser(req.user.id);
			res.json(data);
		} catch (error) {
			res.status(500).json({ message: 'Erro ao buscar workspaces do usuário', error: String(error) });
		}
	},

	async canAccess(req, res) {
		const id = Number(req.params.id);
		const userId = req.user.id;
		try {
			const allowed = await service.canAccess(userId, id);
			res.json({ allowed });
		} catch (e) {
			res.status(500).json({ message: 'Erro ao checar acesso' });
		}
	},

	async getById(req, res) {
		try {
			const data = await service.getById(req.params.id);
			if (!data) return res.status(404).json({ message: 'Workspace não encontrado' });
			res.json(data);
		} catch {
			res.status(500).json({ message: 'Erro ao buscar workspace' });
		}
	},

	async create(req, res) {
		try {
			const data = await service.create(req.body);
			res.status(201).json(data);
		} catch (error) {
			res.status(400).json({ message: error.message });
		}
	},

	async update(req, res) {
		try {
			const data = await service.update(Number(req.params.id), req.body);
			res.json(data);
		} catch (error) {
			res.status(400).json({ message: error.message });
		}
	},

	async deleteMany(req, res) {
		try {
			await service.deleteMany(req.body.ids);
			res.json({ message: 'Workspaces excluídos com sucesso' });
		} catch {
			res.status(500).json({ message: 'Erro ao excluir workspaces' });
		}
	}
};
