const service = require("../services/task.service");
const { formatSPDateTime, formatSPDate } = require("../utils/datetime");
const { deadlineState } = require("../utils/deadline");

function serializeTask(t) {
  if (!t) return t;

  return {
    ...t,
    idTask: t.idTask,
    createdAt: formatSPDateTime(t.createdAt),
    updatedAt: formatSPDateTime(t.updatedAt),
    startDate: formatSPDateTime(t.startDate),
    deadline: formatSPDate(t.deadline),
    deadlineInfo: deadlineState(t.deadline),
  };
}

module.exports = {
  async getAllTasks(req, res) {
    try {     
      const tasks = await service.getAllTasks(req.user.id);
      res.json(tasks.map(serializeTask));
    } catch (e) {
      res.status(400).json({ message: e?.message || "Erro ao buscar tarefas" });
    }
  },

  async getTasks(req, res) {
    try {
      const { workspaceId, stepId, sprintId } = req.query;
      const params = {
        workspaceId,
        stepId,
        sprintId: sprintId === 'null' ? null : sprintId,
      };
      const tasks = await service.getTasks(params);
      res.json(tasks.map(serializeTask));
    } catch (e) {
      res.status(400).json({ message: e?.message || "Erro ao buscar tarefas" });
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.params;
      const task = await service.getById(Number(id));
      if (!task) return res.status(404).json({ message: "Não encontrada" });
      res.json(serializeTask(task));
    } catch (e) {
      res.status(400).json({ message: e?.message || "Erro ao buscar tarefa" });
    }
  },

  async create(req, res) {
    try {
      const body = { ...req.body };

      if (!body.userId) {
        const fallback = body.reporterId ?? body.assigneeId;
        if (!fallback) return res.status(400).json({ message: "userId é obrigatório" });
        body.userId = fallback;
      }
      if (!body.workspaceId) {
        return res.status(400).json({ message: "workspaceId é obrigatório" });
      }

      const created = await service.create(body);
      res.status(201).json(serializeTask(created));
    } catch (e) {
      res.status(400).json({ message: e?.message || "Erro ao criar tarefa" });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const updated = await service.update(Number(id), req.body);
      res.json(serializeTask(updated));
    } catch (e) {
      res.status(400).json({ message: e?.message || "Erro ao atualizar tarefa" });
    }
  },

  async removeMany(req, res) {
    try {
      const { ids } = req.body;
      await service.removeMany(ids || []);
      res.json({ message: "Removida(s) com sucesso!" });
    } catch (e) {
      const code = e.statusCode || 400;
      res.status(code).json({ message: e?.message || "Erro ao remover tarefas" });
    }
  },

  async move(req, res) {
    try {
      const { id } = req.params;
      const { stepId } = req.body;
      if (!stepId) return res.status(400).json({ message: "stepId é obrigatório" });
      const updated = await service.move(Number(id), Number(stepId));
      res.json(serializeTask(updated));
    } catch (e) {
      res.status(400).json({ message: e?.message || "Não foi possível mover a tarefa" });
    }
  },
};
