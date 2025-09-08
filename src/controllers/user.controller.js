const userService = require("../services/user.service");

module.exports = {
	async getAll(req, res) {
		const users = await userService.getAll();
		res.json(users);
	},

	async getById(req, res) {
		const { id } = req.params;
		const user = await userService.getById(Number(id));
		if (!user) return res.status(404).json({ message: "Usuário não encontrado" });
		res.json(user);
	},

	async create(req, res) {
		try {
			const user = await userService.create(req.body);
			res.status(201).json(user);
		} catch (err) {
			res.status(err.status || 500).json({ message: err.message || "Erro ao criar usuário" });
		}
	},

	async update(req, res) {
		const { id } = req.params;
		try {
			const user = await userService.update(Number(id), req.body);
			res.json(user);
		} catch (err) {
			res.status(err.status || 404).json({ message: err.message || "Usuário não encontrado" });
		}
	},

	async removeMany(req, res) {
		const { ids } = req.body;
		if (!Array.isArray(ids) || ids.length === 0) {
			return res.status(400).json({ message: "Nenhum ID fornecido para exclusão" });
		}
		try {
			await userService.removeMany(ids.map(Number));
			res.json({ message: "Usuários excluídos com sucesso" });
		} catch (error) {
			res.status(500).json({ message: "Erro ao excluir usuários", error: String(error) });
		}
	},
};
