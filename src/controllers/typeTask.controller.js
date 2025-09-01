const service = require('../services/typeTask.service');

module.exports = {
	async getAll(req, res) {
		const items = await service.getAll();
		res.json(items);
	},

	async getById(req, res) {
		const { id } = req.params;
		const item = await service.getById(Number(id));
		if (!item) return res.status(404).json({ message: 'Tipo de Atividade não encontrado' });
		res.json(item);
	},

	async create(req, res) {
		const item = await service.create(req.body);
		res.status(201).json(item);
	},

	async update(req, res) {
		const { id } = req.params;
		try {
			const item = await service.update(Number(id), req.body);
			res.json(item);
		} catch {
			res.status(404).json({ message: 'Tipo de Atividade não encontrado' });
		}
	},

	async deleteMany(req, res) {
		const { ids } = req.body;

		if (!Array.isArray(ids) || ids.length === 0) {
			return res.status(400).json({ message: 'Nenhum ID fornecido' });
		}

		try {
			await service.deleteMany(ids);
			res.json({ message: 'Tipos de Atividade excluídos com sucesso' });
		} catch (error) {
			res.status(500).json({ message: 'Erro ao excluir Tipos de Atividade', error });
		}
	}
};
