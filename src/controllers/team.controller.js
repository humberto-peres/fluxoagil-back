const teamService = require("../services/team.service");

module.exports = {
	async getAll(req, res) {
		const teams = await teamService.getAll();
		res.json(teams);
	},

	async getById(req, res) {
		const { id } = req.params;
		try {
			const team = await teamService.getById(Number(id));
			if (!team) {
				return res.status(404).json({ message: "Equipe não encontrada" });
			}
			res.json(team);
		} catch (err) {
			res
				.status(500)
				.json({ message: "Erro ao buscar equipe", error: err.message });
		}
	},

	async create(req, res) {
		try {
			const team = await teamService.create(req.body);
			res.status(201).json(team);
		} catch (err) {
			res
				.status(400)
				.json({ message: "Erro ao criar equipe", error: err.message });
		}
	},

	async update(req, res) {
		const { id } = req.params;
		try {
			const team = await teamService.update(Number(id), req.body);
			res.json(team);
		} catch (err) {
			res
				.status(400)
				.json({ message: "Erro ao atualizar equipe", error: err.message });
		}
	},

	async removeMany(req, res) {
		const { ids } = req.body;

		if (!Array.isArray(ids) || ids.length === 0) {
			return res
				.status(400)
				.json({ message: "Nenhum ID fornecido para exclusão" });
		}

		try {
			await teamService.removeMany(ids.map(Number));
			res.json({ message: "Equipes excluídas com sucesso" });
		} catch (err) {
			res
				.status(500)
				.json({ message: "Erro ao excluir equipes", error: err.message });
		}
	},
};
