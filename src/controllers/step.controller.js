const service = require('../services/step.service');

module.exports = {
	async getAll(req, res) {
		const { workspaceId } = req.query;
		
		const steps = await service.getAll(workspaceId ? Number(workspaceId) : undefined);
		res.json(steps);
	},

	async getById(req, res) {
		const { id } = req.params;
		const step = await service.getById(Number(id));
		if (!step) return res.status(404).json({ message: 'Etapa não encontrada' });
		res.json(step);
	},

	async create(req, res) {
		const step = await service.create(req.body);
		res.status(201).json(step);
	},

	async update(req, res) {
		const { id } = req.params;
		try {
			const step = await service.update(Number(id), req.body);
			res.json(step);
		} catch {
			res.status(404).json({ message: 'Etapa não encontrada' });
		}
	},

	async removeMany(req, res) {
		const { ids } = req.body;

		if (!Array.isArray(ids) || ids.length === 0) {
			return res.status(400).json({ message: 'Nenhum ID fornecido' });
		}

		try {
			await service.removeMany(ids);
			res.json({ message: 'Etapas excluídas com sucesso' });
		} catch (error) {
			res.status(500).json({ message: 'Erro ao excluir etapas', error });
		}
	}
};
