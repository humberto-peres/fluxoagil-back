const express = require('express');
const router = express.Router();
const controller = require('../controllers/step.controller');
const { authRequired } = require('../middlewares/auth');

/**
 * @swagger
 * tags:
 *   name: Steps
 *   description: Gerenciamento de etapas (steps) do workflow
 */
router.use(authRequired);

/**
 * @swagger
 * /steps:
 *   get:
 *     summary: Lista todas as etapas
 *     description: Retorna todas as etapas disponíveis no sistema
 *     tags: [Steps]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Lista de etapas retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Step'
 *             example:
 *               - id: 1
 *                 name: A Fazer
 *                 createdAt: "2025-01-15T10:00:00.000Z"
 *                 updatedAt: "2025-01-15T10:00:00.000Z"
 *               - id: 2
 *                 name: Em Desenvolvimento
 *                 createdAt: "2025-01-15T10:00:00.000Z"
 *                 updatedAt: "2025-01-15T10:00:00.000Z"
 *               - id: 3
 *                 name: Em Revisão
 *                 createdAt: "2025-01-15T10:00:00.000Z"
 *                 updatedAt: "2025-01-15T10:00:00.000Z"
 *               - id: 4
 *                 name: Concluído
 *                 createdAt: "2025-01-15T10:00:00.000Z"
 *                 updatedAt: "2025-01-15T10:00:00.000Z"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/', controller.getAll);

/**
 * @swagger
 * /steps/{id}:
 *   get:
 *     summary: Busca uma etapa por ID
 *     tags: [Steps]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da etapa
 *         example: 1
 *     responses:
 *       200:
 *         description: Etapa encontrada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Step'
 *       404:
 *         description: Etapa não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Etapa não encontrada
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/:id', controller.getById);

/**
 * @swagger
 * /steps:
 *   post:
 *     summary: Cria uma nova etapa
 *     description: Cria uma nova etapa no sistema. Etapas podem ser associadas a workspaces posteriormente.
 *     tags: [Steps]
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
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nome da etapa
 *                 example: Em Homologação
 *           examples:
 *             todo:
 *               summary: Etapa "A Fazer"
 *               value:
 *                 name: A Fazer
 *             inProgress:
 *               summary: Etapa "Em Desenvolvimento"
 *               value:
 *                 name: Em Desenvolvimento
 *             review:
 *               summary: Etapa "Em Revisão"
 *               value:
 *                 name: Em Revisão
 *             done:
 *               summary: Etapa "Concluído"
 *               value:
 *                 name: Concluído
 *     responses:
 *       201:
 *         description: Etapa criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Step'
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
 * /steps/{id}:
 *   put:
 *     summary: Atualiza uma etapa existente
 *     tags: [Steps]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da etapa
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
 *                 description: Novo nome da etapa
 *                 example: Em Desenvolvimento (Revisado)
 *     responses:
 *       200:
 *         description: Etapa atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Step'
 *       404:
 *         description: Etapa não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Etapa não encontrada
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.put('/:id', controller.update);

/**
 * @swagger
 * /steps:
 *   delete:
 *     summary: Remove múltiplas etapas
 *     description: |
 *       Remove permanentemente uma ou mais etapas do banco de dados.
 *       ATENÇÃO: Esta operação pode falhar se houver tarefas associadas às etapas.
 *     tags: [Steps]
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
 *                 minItems: 1
 *                 description: Array de IDs das etapas a serem removidas
 *                 example: [1, 2, 3]
 *     responses:
 *       200:
 *         description: Etapas excluídas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Etapas excluídas com sucesso
 *       400:
 *         description: Nenhum ID fornecido ou IDs inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Nenhum ID fornecido
 *       500:
 *         description: Erro ao excluir etapas (possível constraint de FK)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Erro ao excluir etapas
 *                 error:
 *                   type: object
 *                   description: Detalhes do erro
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.delete('/', controller.removeMany);

module.exports = router;
