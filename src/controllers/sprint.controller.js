const service = require('../services/sprint.service');
const { formatSPDateTime, formatSPDate } = require('../utils/datetime');

function serializeSprint(s) {
  if (!s) return s;
  return {
    ...s,
    startDate: formatSPDate(s.startDate),
    endDate: formatSPDate(s.endDate),
    activatedAt: s.activatedAt ? formatSPDateTime(s.activatedAt) : null,
    closedAt: s.closedAt ? formatSPDateTime(s.closedAt) : null,
    createdAt: formatSPDateTime(s.createdAt),
    updatedAt: formatSPDateTime(s.updatedAt),
  };
}

module.exports = {
  async getAll(req, res) {
    const { workspaceId, active, state } = req.query;
    const isActive = typeof active === 'string' ? active === 'true' : undefined;
    const list = await service.getAll({ workspaceId, state, isActive });
    res.json(list.map(serializeSprint));
  },

  async getById(req, res) {
    const sprint = await service.getById(Number(req.params.id));
    if (!sprint) return res.status(404).json({ message: 'Não encontrada' });
    res.json(serializeSprint(sprint));
  },

  async create(req, res) {
    const created = await service.create(req.body);
    res.status(201).json(serializeSprint(created));
  },

  async update(req, res) {
    const updated = await service.update(Number(req.params.id), req.body);
    res.json(serializeSprint(updated));
  },

  async removeMany(req, res) {
    const { ids } = req.body;
    await service.removeMany(ids || []);
    res.json({ message: 'Removida(s) com sucesso!' });
  },

  async activate(req, res) {
    const updated = await service.activate(Number(req.params.id));
    res.json(serializeSprint(updated));
  },

  async close(req, res) {
    const { move } = req.body || {};
    const result = await service.close(Number(req.params.id), { move });
    res.json({ sprint: serializeSprint(result.sprint), movedCount: result.movedCount });
  },
};
