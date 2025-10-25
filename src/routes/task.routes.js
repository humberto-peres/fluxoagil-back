const express = require('express');
const router = express.Router();
const controller = require('../controllers/task.controller');
const { authRequired } = require('../middlewares/auth');

/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: Gerenciamento de tarefas
 */

router.use(authRequired);

/**
 * @swagger
 * /tasks/all:
 *   get:
 *     summary: Lista todas as tarefas do usuário autenticado
 *     description: Retorna todas as tarefas dos workspaces onde o usuário é membro da equipe
 *     tags: [Tasks]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Lista de tarefas retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 allOf:
 *                   - $ref: '#/components/schemas/Task'
 *                   - type: object
 *                     properties:
 *                       deadlineInfo:
 *                         type: object
 *                         description: Informações sobre o estado do prazo
 *                         properties:
 *                           status:
 *                             type: string
 *                             enum: [overdue, warning, ok, none]
 *                           daysRemaining:
 *                             type: integer
 *                             nullable: true
 *                       priority:
 *                         $ref: '#/components/schemas/Priority'
 *                       typeTask:
 *                         $ref: '#/components/schemas/TypeTask'
 *                       reporter:
 *                         $ref: '#/components/schemas/User'
 *                       assignee:
 *                         $ref: '#/components/schemas/User'
 *                         nullable: true
 *                       step:
 *                         $ref: '#/components/schemas/Step'
 *                       sprint:
 *                         type: object
 *                         nullable: true
 *                         properties:
 *                           id:
 *                             type: integer
 *                           workspaceId:
 *                             type: integer
 *                       workspace:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           key:
 *                             type: string
 *                       epic:
 *                         type: object
 *                         nullable: true
 *                         properties:
 *                           id:
 *                             type: integer
 *                           key:
 *                             type: string
 *                           title:
 *                             type: string
 *       400:
 *         description: Erro ao buscar tarefas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/all', controller.getAllTasks);

/**
 * @swagger
 * /tasks:
 *   get:
 *     summary: Lista tarefas com filtros
 *     description: Retorna tarefas filtradas por workspace, step e/ou sprint
 *     tags: [Tasks]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: workspaceId
 *         schema:
 *           type: integer
 *         description: Filtrar por workspace
 *         example: 1
 *       - in: query
 *         name: stepId
 *         schema:
 *           type: integer
 *         description: Filtrar por etapa
 *         example: 2
 *       - in: query
 *         name: sprintId
 *         schema:
 *           type: string
 *         description: |
 *           Filtrar por sprint:
 *           - ID numérico para uma sprint específica
 *           - "null" (string) para tarefas sem sprint (backlog)
 *         examples:
 *           withSprint:
 *             summary: Com sprint
 *             value: "1"
 *           backlog:
 *             summary: Backlog (sem sprint)
 *             value: "null"
 *     responses:
 *       200:
 *         description: Lista de tarefas retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Task'
 *       400:
 *         description: Erro ao buscar tarefas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/', controller.getTasks);

/**
 * @swagger
 * /tasks/{id}:
 *   get:
 *     summary: Busca uma tarefa por ID
 *     tags: [Tasks]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da tarefa
 *         example: 1
 *     responses:
 *       200:
 *         description: Tarefa encontrada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Task'
 *                 - type: object
 *                   properties:
 *                     deadlineInfo:
 *                       type: object
 *                       description: Estado do prazo calculado
 *                     priority:
 *                       $ref: '#/components/schemas/Priority'
 *                     typeTask:
 *                       $ref: '#/components/schemas/TypeTask'
 *                     reporter:
 *                       $ref: '#/components/schemas/User'
 *                     assignee:
 *                       $ref: '#/components/schemas/User'
 *                       nullable: true
 *                     step:
 *                       $ref: '#/components/schemas/Step'
 *                     sprint:
 *                       type: object
 *                       nullable: true
 *                       properties:
 *                         id:
 *                           type: integer
 *                         workspaceId:
 *                           type: integer
 *                         name:
 *                           type: string
 *       404:
 *         description: Tarefa não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Não encontrada
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/:id', controller.getById);

/**
 * @swagger
 * /tasks:
 *   post:
 *     summary: Cria uma nova tarefa
 *     description: |
 *       Cria uma nova tarefa no workspace. A tarefa recebe automaticamente um ID único no formato KEY-N.
 *       Validações importantes:
 *       - Step deve pertencer ao workspace
 *       - Sprint (se informada) deve pertencer ao mesmo workspace
 *       - Epic (se informado) deve pertencer ao mesmo workspace
 *     tags: [Tasks]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - workspaceId
 *               - stepId
 *               - priorityId
 *               - typeTaskId
 *             properties:
 *               title:
 *                 type: string
 *                 description: Título da tarefa
 *                 example: Implementar autenticação JWT
 *               description:
 *                 type: string
 *                 nullable: true
 *                 description: Descrição detalhada
 *                 example: Criar sistema de auth com JWT e refresh tokens
 *               workspaceId:
 *                 type: integer
 *                 description: ID do workspace (obrigatório)
 *                 example: 1
 *               stepId:
 *                 type: integer
 *                 description: ID da etapa (obrigatório, deve pertencer ao workspace)
 *                 example: 2
 *               priorityId:
 *                 type: integer
 *                 description: ID da prioridade (obrigatório)
 *                 example: 1
 *               typeTaskId:
 *                 type: integer
 *                 description: ID do tipo de tarefa (obrigatório)
 *                 example: 1
 *               userId:
 *                 type: integer
 *                 description: ID do usuário criador (fallback para reporterId ou assigneeId)
 *                 example: 1
 *               reporterId:
 *                 type: integer
 *                 nullable: true
 *                 description: ID do usuário que reportou
 *                 example: 1
 *               assigneeId:
 *                 type: integer
 *                 nullable: true
 *                 description: ID do usuário responsável
 *                 example: 2
 *               sprintId:
 *                 type: integer
 *                 nullable: true
 *                 description: ID da sprint (deve pertencer ao mesmo workspace)
 *                 example: 1
 *               epicId:
 *                 type: integer
 *                 nullable: true
 *                 description: ID do épico (deve pertencer ao mesmo workspace)
 *                 example: 1
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *                 description: Data de início
 *                 example: "2025-10-20T10:00:00"
 *               deadline:
 *                 type: string
 *                 format: date
 *                 nullable: true
 *                 description: Prazo final
 *                 example: "2025-11-15"
 *               estimate:
 *                 type: string
 *                 nullable: true
 *                 description: Estimativa de tempo
 *                 example: "8h"
 *               status:
 *                 type: string
 *                 description: Status da tarefa (usa stepId se omitido)
 *                 example: "in_progress"
 *     responses:
 *       201:
 *         description: Tarefa criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *             example:
 *               id: 42
 *               idTask: "PROJ-42"
 *               title: Implementar autenticação JWT
 *               workspaceId: 1
 *       400:
 *         description: Erro de validação
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               missingUserId:
 *                 summary: userId ausente
 *                 value:
 *                   message: userId é obrigatório
 *               missingWorkspace:
 *                 summary: workspaceId ausente
 *                 value:
 *                   message: workspaceId é obrigatório
 *               stepNotInWorkspace:
 *                 summary: Step não pertence ao workspace
 *                 value:
 *                   message: A etapa informada não pertence ao workspace.
 *               sprintNotInWorkspace:
 *                 summary: Sprint de outro workspace
 *                 value:
 *                   message: workspaceId difere do workspace da sprint.
 *               epicNotInWorkspace:
 *                 summary: Epic de outro workspace
 *                 value:
 *                   message: O épico informado pertence a outro workspace.
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.post('/', controller.create);

/**
 * @swagger
 * /tasks/{id}:
 *   put:
 *     summary: Atualiza uma tarefa existente
 *     description: |
 *       Atualiza campos de uma tarefa. Todas as mesmas validações da criação se aplicam.
 *       Validações:
 *       - Step deve pertencer ao workspace
 *       - Sprint (se informada) deve pertencer ao mesmo workspace
 *       - Epic (se informado) deve pertencer ao mesmo workspace
 *     tags: [Tasks]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da tarefa
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *                 nullable: true
 *               workspaceId:
 *                 type: integer
 *               stepId:
 *                 type: integer
 *               priorityId:
 *                 type: integer
 *               typeTaskId:
 *                 type: integer
 *               userId:
 *                 type: integer
 *               reporterId:
 *                 type: integer
 *                 nullable: true
 *               assigneeId:
 *                 type: integer
 *                 nullable: true
 *               sprintId:
 *                 type: integer
 *                 nullable: true
 *                 description: Use null para remover da sprint
 *               epicId:
 *                 type: integer
 *                 nullable: true
 *                 description: Use null para remover do épico
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *               deadline:
 *                 type: string
 *                 format: date
 *                 nullable: true
 *               estimate:
 *                 type: string
 *                 nullable: true
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Tarefa atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       400:
 *         description: Erro de validação
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.put('/:id', controller.update);

/**
 * @swagger
 * /tasks:
 *   delete:
 *     summary: Remove múltiplas tarefas
 *     description: |
 *       Remove permanentemente uma ou mais tarefas.
 *       IMPORTANTE: Não é possível excluir tarefas vinculadas a épicos.
 *     tags: [Tasks]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ids
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Array de IDs das tarefas a serem removidas
 *                 example: [1, 2, 3]
 *     responses:
 *       200:
 *         description: Tarefas removidas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Removida(s) com sucesso!
 *       409:
 *         description: Conflito - Tarefas vinculadas a épicos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Não é possível excluir: PROJ-1, PROJ-2 estão vinculadas a um épico."
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.delete('/', controller.removeMany);

/**
 * @swagger
 * /tasks/{id}/move:
 *   put:
 *     summary: Move uma tarefa para outra etapa
 *     description: |
 *       Move uma tarefa para uma nova etapa do workflow.
 *       A etapa de destino deve pertencer ao workspace da tarefa.
 *       O status da tarefa é automaticamente atualizado para o stepId.
 *     tags: [Tasks]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da tarefa a ser movida
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - stepId
 *             properties:
 *               stepId:
 *                 type: integer
 *                 description: ID da etapa de destino (obrigatório)
 *                 example: 3
 *     responses:
 *       200:
 *         description: Tarefa movida com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       400:
 *         description: Erro de validação
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               missingStepId:
 *                 summary: stepId ausente
 *                 value:
 *                   message: stepId é obrigatório
 *               taskNotFound:
 *                 summary: Tarefa não existe
 *                 value:
 *                   message: Tarefa inexistente.
 *               stepNotInWorkspace:
 *                 summary: Step não pertence ao workspace
 *                 value:
 *                   message: A etapa informada não pertence ao workspace.
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.put('/:id/move', controller.move);

module.exports = router;
