const service = require("../services/epic.service");
const { formatSPDateTime, formatSPDate } = require("../utils/datetime");

function serializeEpic(e) {
  if (!e) return e;
  return {
    ...e,
    createdAt: formatSPDateTime(e.createdAt),
    updatedAt: formatSPDateTime(e.updatedAt),
    startDate: formatSPDate(e.startDate),
    targetDate: formatSPDate(e.targetDate),
    tasks: Array.isArray(e.tasks)
      ? e.tasks.map((t) => ({
        ...t,
        createdAt: formatSPDateTime(t.createdAt),
        updatedAt: formatSPDateTime(t.updatedAt),
        startDate: formatSPDateTime(t.startDate),
        deadline: formatSPDate(t.deadline),
      }))
      : e.tasks,
  };
}

module.exports = {
  async getAll(req, res) {
    const { workspaceId, status } = req.query;
    const list = await service.getAll({ workspaceId, status });
    res.json(list.map(serializeEpic));
  },

  async getById(req, res) {
    const { id } = req.params;
    const epic = await service.getById(id);
    if (!epic) return res.status(404).json({ message: "Não encontrado" });
    res.json(serializeEpic(epic));
  },

  async create(req, res) {
    if (!req.body?.workspaceId) {
      return res.status(400).json({ message: "workspaceId é obrigatório" });
    }
    const created = await service.create(req.body);
    res.status(201).json(serializeEpic(created));
  },

  async update(req, res) {
    const { id } = req.params;
    const updated = await service.update(id, req.body);
    res.json(serializeEpic(updated));
  },

  async removeMany(req, res) {
    const { ids } = req.body;
    try {
      await service.removeMany(ids || []);
      res.json({ message: "Épico(s) removido(s) com sucesso!" });
    } catch (e) {
      const code = e.statusCode || 500;
      res.status(code).json({ message: e.message || "Erro ao remover épico(s)" });
    }
  },
};
