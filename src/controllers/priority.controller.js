const service = require("../services/priority.service");

module.exports = {
	async getAll(req, res) {
		const priorities = await service.getAll();
		res.json(priorities);
	},

	async getById(req, res) {
		const { id } = req.params;
		const priority = await service.getById(Number(id));
		if (!priority) return res.status(404).json({ message: "Não encontrada" });
		res.json(priority);
	},

	async create(req, res) {
		const created = await service.create(req.body);
		res.status(201).json(created);
	},

	async update(req, res) {
		const { id } = req.params;
		const updated = await service.update(Number(id), req.body);
		res.json(updated);
	},

	async removeMany(req, res) {
		const { ids } = req.body;
		await service.removeMany(ids);
		res.json({ message: "Removido com sucesso!" });
	},
};
