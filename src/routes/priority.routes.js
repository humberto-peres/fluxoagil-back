const express = require('express');
const router = express.Router();
const controller = require('../controllers/priority.controller');
const { authRequired } = require('../middlewares/auth');

/**
 * @swagger
 * tags:
 *   name: Priorities
 *   description: Gerenciamento de prioridades
 */
router.use(authRequired);

/**
 * @swagger
 * /priorities:
 *   get:
 *     summary: Lista todas as prioridades
 *     tags: [Priorities]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Lista de prioridades retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Priority'
 *             example:
 *               - id: 1
 *                 label: Alta
 *                 name: high
 *                 deleted: false
 *                 createdAt: "2025-01-15T10:00:00.000Z"
 *                 updatedAt: "2025-01-15T10:00:00.000Z"
 *               - id: 2
 *                 label: Média
 *                 name: medium
 *                 deleted: false
 *                 createdAt: "2025-01-15T10:00:00.000Z"
 *                 updatedAt: "2025-01-15T10:00:00.000Z"
 *               - id: 3
 *                 label: Baixa
 *                 name: low
 *                 deleted: false
 *                 createdAt: "2025-01-15T10:00:00.000Z"
 *                 updatedAt: "2025-01-15T10:00:00.000Z"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/', controller.getAll);

/**
 * @swagger
 * /priorities/{id}:
 *   get:
 *     summary: Busca uma prioridade por ID
 *     tags: [Priorities]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da prioridade
 *         example: 1
 *     responses:
 *       200:
 *         description: Prioridade encontrada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Priority'
 *       404:
 *         description: Prioridade não encontrada
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
 * /priorities:
 *   post:
 *     summary: Cria uma nova prioridade
 *     tags: [Priorities]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - label
 *               - name
 *             properties:
 *               label:
 *                 type: string
 *                 description: Rótulo da prioridade (exibição)
 *                 example: Urgente
 *               name:
 *                 type: string
 *                 description: Nome técnico da prioridade
 *                 example: urgent
 *               deleted:
 *                 type: boolean
 *                 description: Indica se está deletada (soft delete)
 *                 default: false
 *                 example: false
 *     responses:
 *       201:
 *         description: Prioridade criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Priority'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.post('/', controller.create);

/**
 * @swagger
 * /priorities/{id}:
 *   put:
 *     summary: Atualiza uma prioridade existente
 *     tags: [Priorities]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da prioridade
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               label:
 *                 type: string
 *                 description: Novo rótulo
 *                 example: Muito Urgente
 *               name:
 *                 type: string
 *                 description: Novo nome técnico
 *                 example: critical
 *               deleted:
 *                 type: boolean
 *                 description: Marcar como deletada (soft delete)
 *                 example: true
 *     responses:
 *       200:
 *         description: Prioridade atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Priority'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.put('/:id', controller.update);

/**
 * @swagger
 * /priorities:
 *   delete:
 *     summary: Remove múltiplas prioridades
 *     description: Remove permanentemente uma ou mais prioridades do banco de dados
 *     tags: [Priorities]
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
 *                 description: Array de IDs das prioridades a serem removidas
 *                 example: [1, 2, 3]
 *     responses:
 *       200:
 *         description: Prioridades removidas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Removido com sucesso!
 *       400:
 *         description: IDs inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.delete('/', controller.removeMany);

module.exports = router;
