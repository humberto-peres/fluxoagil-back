const taskController = require("../../../src/controllers/task.controller");
const taskService = require("../../../src/services/task.service");

jest.mock("../../../src/services/task.service");
jest.mock("../../../src/utils/datetime", () => ({
  formatSPDateTime: jest.fn((date) => (date ? "2024-01-01T10:00:00" : null)),
  formatSPDate: jest.fn((date) => (date ? "2024-01-01" : null)),
}));
jest.mock("../../../src/utils/deadline", () => ({
  deadlineState: jest.fn(() => ({ status: "on-time", daysRemaining: 5 })),
}));

describe("Task Controller", () => {
  let req, res;

  beforeEach(() => {
    req = { query: {}, params: {}, body: {}, user: { id: 1 } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
    jest.clearAllMocks();
  });

  describe("getAllTasks", () => {
    test('deve retornar todas as tarefas do usuário', async () => {
      const mockTasks = [
        { id: 1, title: 'Task 1', createdAt: new Date() },
        { id: 2, title: 'Task 2', createdAt: new Date() },
      ];
      taskService.getAllTasks.mockResolvedValue(mockTasks);

      await taskController.getAllTasks(req, res);

      expect(taskService.getAllTasks).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalled();
    });

    test("deve tratar erro do service", async () => {
      taskService.getAllTasks.mockRejectedValue(new Error("Database error"));

      await taskController.getAllTasks(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Database error" });
    });
  });

  describe("getTasks", () => {
    test("deve retornar tarefas filtradas", async () => {
      req.query = { workspaceId: "5", stepId: "2" };
      taskService.getTasks.mockResolvedValue([]);

      await taskController.getTasks(req, res);

      expect(taskService.getTasks).toHaveBeenCalledWith({ workspaceId: "5", stepId: "2", sprintId: undefined });
      expect(res.json).toHaveBeenCalledWith([]);
    });

    test('deve converter sprintId "null" para null', async () => {
      req.query = { sprintId: "null" };
      taskService.getTasks.mockResolvedValue([]);

      await taskController.getTasks(req, res);

      expect(taskService.getTasks).toHaveBeenCalledWith({ workspaceId: undefined, stepId: undefined, sprintId: null });
    });

    test("deve tratar erro do service", async () => {
      taskService.getTasks.mockRejectedValue(new Error("Filtro inválido"));

      await taskController.getTasks(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Filtro inválido" });
    });
  });

  describe("getById", () => {
    test("deve retornar tarefa por id", async () => {
      const mockTask = { idTask: 1, title: "Test Task" };
      req.params.id = "1";
      taskService.getById.mockResolvedValue(mockTask);

      await taskController.getById(req, res);

      expect(taskService.getById).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ idTask: 1 }));
    });

    test("deve retornar 404 quando tarefa não existir", async () => {
      req.params.id = "999";
      taskService.getById.mockResolvedValue(null);

      await taskController.getById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Não encontrada" });
    });

    test("deve tratar erro do service", async () => {
      req.params.id = "1";
      taskService.getById.mockRejectedValue(new Error("Database error"));

      await taskController.getById(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Database error" });
    });
  });

  describe("create", () => {
    test("deve criar tarefa com sucesso", async () => {
      const newTask = { title: "Nova Task", workspaceId: 1, userId: 5 };
      req.body = newTask;
      taskService.create.mockResolvedValue({ ...newTask });

      await taskController.create(req, res);

      expect(taskService.create).toHaveBeenCalledWith(newTask);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ title: "Nova Task" }));
    });

    test("deve usar reporterId como fallback para userId", async () => {
      req.body = { title: "Task", workspaceId: 1, reporterId: 10 };
      taskService.create.mockResolvedValue({ userId: 10 });

      await taskController.create(req, res);

      expect(taskService.create).toHaveBeenCalledWith(expect.objectContaining({ userId: 10 }));
    });

    test("deve retornar 400 quando userId e fallbacks não forem fornecidos", async () => {
      req.body = { title: "Task", workspaceId: 1 };

      await taskController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "userId é obrigatório" });
      expect(taskService.create).not.toHaveBeenCalled();
    });

    test("deve retornar 400 quando workspaceId não for fornecido", async () => {
      req.body = { title: "Task", userId: 1 };

      await taskController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "workspaceId é obrigatório" });
      expect(taskService.create).not.toHaveBeenCalled();
    });

    test("deve tratar erro do service", async () => {
      req.body = { title: "Task", workspaceId: 1, userId: 1 };
      taskService.create.mockRejectedValue(new Error("Validation failed"));

      await taskController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Validation failed" });
    });
  });

  describe("update", () => {
    test("deve atualizar tarefa com sucesso", async () => {
      req.params.id = "1";
      req.body = { title: "Atualizado" };
      taskService.update.mockResolvedValue({ idTask: 1, ...req.body });

      await taskController.update(req, res);

      expect(taskService.update).toHaveBeenCalledWith(1, req.body);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ title: "Atualizado" }));
    });

    test("deve tratar erro do service", async () => {
      req.params.id = "1";
      taskService.update.mockRejectedValue(new Error("Erro ao atualizar"));

      await taskController.update(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Erro ao atualizar" });
    });
  });

  describe("removeMany", () => {
    test("deve remover múltiplas tarefas com sucesso", async () => {
      req.body = { ids: [1, 2, 3] };
      taskService.removeMany.mockResolvedValue({ count: 3 });

      await taskController.removeMany(req, res);

      expect(taskService.removeMany).toHaveBeenCalledWith([1, 2, 3]);
      expect(res.json).toHaveBeenCalledWith({ message: "Removida(s) com sucesso!" });
    });

    test("deve tratar erro com statusCode custom", async () => {
      class ServiceError extends Error {
        constructor(msg, code) { super(msg); this.statusCode = code; }
      }
      req.body = { ids: [1] };
      taskService.removeMany.mockRejectedValue(new ServiceError("Conflito", 409));

      await taskController.removeMany(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ message: "Conflito" });
    });
  });

  describe("move", () => {
    test("deve mover tarefa com sucesso", async () => {
      req.params.id = "1";
      req.body.stepId = 5;
      taskService.move.mockResolvedValue({ idTask: 1, stepId: 5 });

      await taskController.move(req, res);

      expect(taskService.move).toHaveBeenCalledWith(1, 5);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ stepId: 5 }));
    });

    test("deve retornar 400 quando stepId não for fornecido", async () => {
      req.params.id = "1";

      await taskController.move(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "stepId é obrigatório" });
      expect(taskService.move).not.toHaveBeenCalled();
    });
  });
});
