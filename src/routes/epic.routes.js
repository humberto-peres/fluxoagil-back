const express = require('express');
const router = express.Router();
const controller = require('../controllers/epic.controller');

/**
 * @swagger
 * tags:
 *   name: Epics
 *   description: Gerenciamento de épicos
 */

/**
 * @swagger
 * /epics:
 *   get:
 *     summary: Lista todos os épicos
 *     tags: [Epics]
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
 *         name: status
 *         schema:
 *           type: string
 *         description: Filtrar por status
 *         example: open
 *     responses:
 *       200:
 *         description: Lista de épicos retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 allOf:
 *                   - $ref: '#/components/schemas/Epic'
 *                   - type: object
 *                     properties:
 *                       priority:
 *                         $ref: '#/components/schemas/Priority'
 *                       _count:
 *                         type: object
 *                         properties:
 *                           tasks:
 *                             type: integer
 *                             example: 5
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/', controller.getAll);

/**
 * @swagger
 * /epics/{id}:
 *   get:
 *     summary: Busca um épico por ID
 *     tags: [Epics]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do épico
 *         example: 1
 *     responses:
 *       200:
 *         description: Épico encontrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Epic'
 *                 - type: object
 *                   properties:
 *                     priority:
 *                       $ref: '#/components/schemas/Priority'
 *                     tasks:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Task'
 *       404:
 *         description: Épico não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Não encontrado
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/:id', controller.getById);

/**
 * @swagger
 * /epics:
 *   post:
 *     summary: Cria um novo épico
 *     tags: [Epics]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - workspaceId
 *               - title
 *             properties:
 *               workspaceId:
 *                 type: integer
 *                 description: ID do workspace (obrigatório)
 *                 example: 1
 *               title:
 *                 type: string
 *                 description: Título do épico
 *                 example: Implementar módulo de relatórios
 *               description:
 *                 type: string
 *                 nullable: true
 *                 description: Descrição detalhada
 *                 example: Criar sistema completo de relatórios gerenciais
 *               status:
 *                 type: string
 *                 description: Status do épico
 *                 default: open
 *                 example: open
 *               startDate:
 *                 type: string
 *                 format: date
 *                 nullable: true
 *                 description: Data de início
 *                 example: 2025-01-15
 *               targetDate:
 *                 type: string
 *                 format: date
 *                 nullable: true
 *                 description: Data alvo de conclusão
 *                 example: 2025-03-30
 *               priorityId:
 *                 type: integer
 *                 nullable: true
 *                 description: ID da prioridade
 *                 example: 1
 *     responses:
 *       201:
 *         description: Épico criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Epic'
 *                 - type: object
 *                   properties:
 *                     priority:
 *                       $ref: '#/components/schemas/Priority'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: workspaceId é obrigatório
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.post('/', controller.create);

/**
 * @swagger
 * /epics/{id}:
 *   put:
 *     summary: Atualiza um épico existente
 *     tags: [Epics]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do épico
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
 *                 description: Novo título
 *                 example: Módulo de relatórios avançados
 *               description:
 *                 type: string
 *                 nullable: true
 *                 description: Nova descrição
 *               status:
 *                 type: string
 *                 description: Novo status
 *                 example: in_progress
 *               startDate:
 *                 type: string
 *                 format: date
 *                 nullable: true
 *                 description: Nova data de início (use null para remover)
 *               targetDate:
 *                 type: string
 *                 format: date
 *                 nullable: true
 *                 description: Nova data alvo (use null para remover)
 *               priorityId:
 *                 type: integer
 *                 nullable: true
 *                 description: Novo ID da prioridade (use null para remover)
 *     responses:
 *       200:
 *         description: Épico atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Epic'
 *                 - type: object
 *                   properties:
 *                     priority:
 *                       $ref: '#/components/schemas/Priority'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.put('/:id', controller.update);

/**
 * @swagger
 * /epics:
 *   delete:
 *     summary: Remove múltiplos épicos
 *     description: Remove um ou mais épicos. Épicos com tarefas associadas não podem ser removidos.
 *     tags: [Epics]
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
 *                 description: Array de IDs dos épicos a serem removidos
 *                 example: [1, 2, 3]
 *     responses:
 *       200:
 *         description: Épicos removidos com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Épico(s) removido(s) com sucesso!
 *       409:
 *         description: Conflito - Épicos possuem tarefas associadas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Não é possível excluir: PROJ-E1, PROJ-E2 possuem atividades associadas."
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.delete('/', controller.removeMany);

module.exports = router;
