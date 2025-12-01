const express = require('express');
const router = express.Router();
const controller = require('../controllers/sprint.controller');
const { authRequired } = require('../middlewares/auth');

/**
 * @swagger
 * tags:
 *   name: Sprints
 *   description: Gerenciamento de sprints (ciclos de trabalho)
 */
router.use(authRequired);

/**
 * @swagger
 * /sprints:
 *   get:
 *     summary: Lista todas as sprints
 *     tags: [Sprints]
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
 *         name: state
 *         schema:
 *           type: string
 *           enum: [active, planned, closed, open]
 *         description: |
 *           Filtrar por estado:
 *           - `active`: Sprint ativa no momento
 *           - `planned`: Sprint planejada (não ativada, não encerrada)
 *           - `closed`: Sprint encerrada
 *           - `open`: Sprint não encerrada (ativa ou planejada)
 *         example: active
 *     responses:
 *       200:
 *         description: Lista de sprints retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Sprint'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/', controller.getAll);

/**
 * @swagger
 * /sprints/{id}:
 *   get:
 *     summary: Busca uma sprint por ID
 *     tags: [Sprints]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da sprint
 *         example: 1
 *     responses:
 *       200:
 *         description: Sprint encontrada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Sprint'
 *       404:
 *         description: Sprint não encontrada
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
 * /sprints:
 *   post:
 *     summary: Cria uma nova sprint
 *     tags: [Sprints]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - workspaceId
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nome da sprint
 *                 example: Sprint 1
 *               workspaceId:
 *                 type: integer
 *                 description: ID do workspace (obrigatório)
 *                 example: 1
 *               startDate:
 *                 type: string
 *                 format: date
 *                 nullable: true
 *                 description: Data de início
 *                 example: "2025-01-20"
 *               endDate:
 *                 type: string
 *                 format: date
 *                 nullable: true
 *                 description: Data de término
 *                 example: "2025-02-03"
 *               isActive:
 *                 type: boolean
 *                 description: |
 *                   Se true, sprint será ativada na criação.
 *                   Neste caso, startDate e endDate são obrigatórios.
 *                 default: false
 *                 example: false
 *               activatedAt:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *                 description: Data/hora de ativação (opcional, usa now() se omitido)
 *     responses:
 *       201:
 *         description: Sprint criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Sprint'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               missingDates:
 *                 summary: Datas obrigatórias para ativação
 *                 value:
 *                   message: Para ativar na criação, defina início e término.
 *               workspaceNotFound:
 *                 summary: Workspace não existe
 *                 value:
 *                   message: Workspace inexistente
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.post('/', controller.create);

/**
 * @swagger
 * /sprints/{id}:
 *   put:
 *     summary: Atualiza uma sprint existente
 *     tags: [Sprints]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da sprint
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Novo nome
 *                 example: Sprint 1 - Revisada
 *               startDate:
 *                 type: string
 *                 format: date
 *                 nullable: true
 *                 description: Nova data de início (use null para remover)
 *               endDate:
 *                 type: string
 *                 format: date
 *                 nullable: true
 *                 description: Nova data de término (use null para remover)
 *               isActive:
 *                 type: boolean
 *                 description: |
 *                   Ativar/desativar sprint.
 *                   Para ativar, startDate e endDate são obrigatórios.
 *                   Sprints encerradas não podem ser reativadas.
 *     responses:
 *       200:
 *         description: Sprint atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Sprint'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               closedSprint:
 *                 summary: Sprint encerrada
 *                 value:
 *                   message: Sprint encerrada não pode ser reativada.
 *               missingDates:
 *                 summary: Datas necessárias
 *                 value:
 *                   message: Para ativar, defina início e término.
 *               notFound:
 *                 summary: Sprint não existe
 *                 value:
 *                   message: Sprint inexistente
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.put('/:id', controller.update);

/**
 * @swagger
 * /sprints:
 *   delete:
 *     summary: Remove múltiplas sprints
 *     description: Remove permanentemente uma ou mais sprints do banco de dados
 *     tags: [Sprints]
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
 *                 description: Array de IDs das sprints a serem removidas
 *                 example: [1, 2, 3]
 *     responses:
 *       200:
 *         description: Sprints removidas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Removida(s) com sucesso!
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.delete('/', controller.removeMany);

/**
 * @swagger
 * /sprints/{id}/activate:
 *   post:
 *     summary: Ativa uma sprint
 *     description: |
 *       Ativa uma sprint planejada. A sprint deve ter startDate e endDate definidos.
 *       Sprints encerradas não podem ser reativadas.
 *     tags: [Sprints]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da sprint a ser ativada
 *         example: 1
 *     responses:
 *       200:
 *         description: Sprint ativada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Sprint'
 *             example:
 *               id: 1
 *               name: Sprint 1
 *               isActive: true
 *               activatedAt: "2025-10-19T10:30:00-03:00"
 *               startDate: "2025-10-20"
 *               endDate: "2025-11-03"
 *               closedAt: null
 *       400:
 *         description: Erro de validação
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               missingDates:
 *                 summary: Datas não definidas
 *                 value:
 *                   message: Defina início e término antes de ativar.
 *               alreadyClosed:
 *                 summary: Sprint já encerrada
 *                 value:
 *                   message: Sprint encerrada não pode ser reativada.
 *               notFound:
 *                 summary: Sprint não existe
 *                 value:
 *                   message: Sprint inexistente
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.post('/:id/activate', controller.activate);

/**
 * @swagger
 * /sprints/{id}/close:
 *   post:
 *     summary: Encerra uma sprint
 *     description: |
 *       Encerra uma sprint e permite mover tarefas não finalizadas.
 *       Tarefas no último step (step final) não são movidas.
 *     tags: [Sprints]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da sprint a ser encerrada
 *         example: 1
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               move:
 *                 type: object
 *                 description: Configuração de movimentação de tarefas
 *                 properties:
 *                   to:
 *                     type: string
 *                     enum: [sprint, backlog]
 *                     description: |
 *                       Destino das tarefas não finalizadas:
 *                       - `sprint`: Move para outra sprint
 *                       - `backlog`: Remove de sprint (backlog)
 *                     example: sprint
 *                   sprintId:
 *                     type: integer
 *                     description: ID da sprint de destino (obrigatório se to=sprint)
 *                     example: 2
 *           examples:
 *             moveToSprint:
 *               summary: Mover tarefas para outra sprint
 *               value:
 *                 move:
 *                   to: sprint
 *                   sprintId: 2
 *             moveToBacklog:
 *               summary: Mover tarefas para backlog
 *               value:
 *                 move:
 *                   to: backlog
 *             noMove:
 *               summary: Mover para backlog (padrão)
 *               value: {}
 *     responses:
 *       200:
 *         description: Sprint encerrada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sprint:
 *                   $ref: '#/components/schemas/Sprint'
 *                 movedCount:
 *                   type: integer
 *                   description: Quantidade de tarefas movidas
 *                   example: 3
 *             example:
 *               sprint:
 *                 id: 1
 *                 name: Sprint 1
 *                 isActive: false
 *                 closedAt: "2025-10-19T10:30:00-03:00"
 *                 startDate: "2025-10-01"
 *                 endDate: "2025-10-19"
 *               movedCount: 3
 *       400:
 *         description: Erro de validação
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               notFound:
 *                 summary: Sprint não existe
 *                 value:
 *                   message: Sprint inexistente
 *               invalidTarget:
 *                 summary: Sprint de destino inválida
 *                 value:
 *                   message: Sprint de destino inválida (diferente do workspace).
 *               targetClosed:
 *                 summary: Sprint de destino encerrada
 *                 value:
 *                   message: Sprint de destino está encerrada.
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.post('/:id/close', controller.close);

module.exports = router;
