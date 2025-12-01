const express = require('express');
const router = express.Router();
const controller = require('../controllers/team.controller');
const { authRequired } = require('../middlewares/auth');

/**
 * @swagger
 * tags:
 *   name: Teams
 *   description: Gerenciamento de equipes
 */
router.use(authRequired);

/**
 * @swagger
 * /teams:
 *   get:
 *     summary: Lista todas as equipes
 *     description: Retorna todas as equipes com seus membros
 *     tags: [Teams]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Lista de equipes retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   name:
 *                     type: string
 *                     example: Time de Desenvolvimento
 *                   members:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         user:
 *                           $ref: '#/components/schemas/User'
 *             example:
 *               - id: 1
 *                 name: Time de Desenvolvimento
 *                 members:
 *                   - user:
 *                       id: 1
 *                       name: João Silva
 *                       email: joao@example.com
 *                       username: joaosilva
 *                       role: user
 *                   - user:
 *                       id: 2
 *                       name: Maria Santos
 *                       email: maria@example.com
 *                       username: mariasantos
 *                       role: admin
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/', controller.getAll);

/**
 * @swagger
 * /teams/{id}:
 *   get:
 *     summary: Busca uma equipe por ID
 *     description: Retorna uma equipe específica com todos os seus membros
 *     tags: [Teams]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da equipe
 *         example: 1
 *     responses:
 *       200:
 *         description: Equipe encontrada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Team'
 *                 - type: object
 *                   properties:
 *                     members:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           userId:
 *                             type: integer
 *                           teamId:
 *                             type: integer
 *                           user:
 *                             $ref: '#/components/schemas/User'
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *       404:
 *         description: Equipe não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Equipe não encontrada
 *       500:
 *         description: Erro interno ao buscar equipe
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Erro ao buscar equipe
 *                 error:
 *                   type: string
 *                   example: Database connection failed
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/:id', controller.getById);

/**
 * @swagger
 * /teams:
 *   post:
 *     summary: Cria uma nova equipe
 *     description: Cria uma nova equipe no sistema. Membros podem ser adicionados posteriormente via TeamMembers.
 *     tags: [Teams]
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
 *                 description: Nome da equipe
 *                 example: Time de Desenvolvimento Frontend
 *           examples:
 *             devTeam:
 *               summary: Time de desenvolvimento
 *               value:
 *                 name: Time de Desenvolvimento
 *             designTeam:
 *               summary: Time de design
 *               value:
 *                 name: Time de Design
 *             qaTeam:
 *               summary: Time de QA
 *               value:
 *                 name: Time de Quality Assurance
 *     responses:
 *       201:
 *         description: Equipe criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Team'
 *       400:
 *         description: Erro ao criar equipe
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Erro ao criar equipe
 *                 error:
 *                   type: string
 *                   example: Name is required
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.post('/', controller.create);

/**
 * @swagger
 * /teams/{id}:
 *   put:
 *     summary: Atualiza uma equipe existente
 *     description: Atualiza o nome de uma equipe. Para gerenciar membros, use as rotas de TeamMembers.
 *     tags: [Teams]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da equipe
 *         example: 1
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
 *                 description: Novo nome da equipe
 *                 example: Time de Desenvolvimento Backend
 *     responses:
 *       200:
 *         description: Equipe atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Team'
 *       400:
 *         description: Erro ao atualizar equipe
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Erro ao atualizar equipe
 *                 error:
 *                   type: string
 *       404:
 *         description: Equipe não encontrada
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.put('/:id', controller.update);

/**
 * @swagger
 * /teams:
 *   delete:
 *     summary: Remove múltiplas equipes
 *     description: |
 *       Remove permanentemente uma ou mais equipes do banco de dados.
 *       IMPORTANTE: Todos os membros (TeamMembers) das equipes também são removidos automaticamente.
 *     tags: [Teams]
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
 *                 description: Array de IDs das equipes a serem removidas
 *                 example: [1, 2, 3]
 *     responses:
 *       200:
 *         description: Equipes excluídas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Equipes excluídas com sucesso
 *       400:
 *         description: Nenhum ID fornecido ou IDs inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Nenhum ID fornecido para exclusão
 *       500:
 *         description: Erro ao excluir equipes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Erro ao excluir equipes
 *                 error:
 *                   type: string
 *                   example: Foreign key constraint violation
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.delete('/', controller.removeMany);

module.exports = router;
