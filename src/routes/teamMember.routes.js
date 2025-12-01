const express = require('express');
const router = express.Router();
const controller = require('../controllers/teamMember.controller');
const { authRequired } = require('../middlewares/auth');

/**
 * @swagger
 * tags:
 *   name: TeamMembers
 *   description: Gerenciamento de membros de equipes
 */
router.use(authRequired);

/**
 * @swagger
 * components:
 *   schemas:
 *     TeamMember:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         userId:
 *           type: integer
 *           example: 5
 *         teamId:
 *           type: integer
 *           example: 2
 *         user:
 *           $ref: '#/components/schemas/User'
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /team-members/{teamId}:
 *   get:
 *     summary: Lista todos os membros de uma equipe
 *     description: Retorna todos os membros de uma equipe específica com seus dados de usuário
 *     tags: [TeamMembers]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da equipe
 *         example: 1
 *     responses:
 *       200:
 *         description: Lista de membros retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TeamMember'
 *             example:
 *               - id: 1
 *                 userId: 1
 *                 teamId: 1
 *                 user:
 *                   id: 1
 *                   name: João Silva
 *                   email: joao@example.com
 *                   username: joaosilva
 *                   role: user
 *                 createdAt: "2025-01-15T10:00:00.000Z"
 *                 updatedAt: "2025-01-15T10:00:00.000Z"
 *               - id: 2
 *                 userId: 2
 *                 teamId: 1
 *                 user:
 *                   id: 2
 *                   name: Maria Santos
 *                   email: maria@example.com
 *                   username: mariasantos
 *                   role: admin
 *                 createdAt: "2025-01-15T10:00:00.000Z"
 *                 updatedAt: "2025-01-15T10:00:00.000Z"
 *       500:
 *         description: Erro ao buscar membros
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Erro ao buscar membros
 *                 error:
 *                   type: object
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/:teamId', controller.getMembers);

/**
 * @swagger
 * /team-members/available/{teamId}:
 *   get:
 *     summary: Lista usuários disponíveis para adicionar à equipe
 *     description: |
 *       Retorna todos os usuários que ainda não são membros da equipe especificada.
 *       Útil para popular dropdowns de adição de membros.
 *     tags: [TeamMembers]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da equipe
 *         example: 1
 *     responses:
 *       200:
 *         description: Lista de usuários disponíveis retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: ID do usuário
 *                     example: 3
 *                   name:
 *                     type: string
 *                     description: Nome do usuário
 *                     example: Carlos Oliveira
 *             example:
 *               - id: 3
 *                 name: Carlos Oliveira
 *               - id: 4
 *                 name: Ana Paula
 *               - id: 5
 *                 name: Pedro Costa
 *       500:
 *         description: Erro ao buscar usuários disponíveis
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Erro ao buscar usuários disponíveis
 *                 error:
 *                   type: object
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/available/:teamId', controller.getAvailableUsers);

/**
 * @swagger
 * /team-members/{teamId}:
 *   post:
 *     summary: Adiciona múltiplos membros a uma equipe
 *     description: |
 *       Adiciona um ou mais usuários como membros de uma equipe.
 *       Duplicatas são automaticamente ignoradas (skipDuplicates: true).
 *     tags: [TeamMembers]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: teamId
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
 *               - userIds
 *             properties:
 *               userIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 minItems: 1
 *                 description: Array de IDs dos usuários a serem adicionados
 *                 example: [3, 4, 5]
 *           examples:
 *             singleMember:
 *               summary: Adicionar um membro
 *               value:
 *                 userIds: [3]
 *             multipleMembers:
 *               summary: Adicionar múltiplos membros
 *               value:
 *                 userIds: [3, 4, 5, 6]
 *     responses:
 *       201:
 *         description: Membros adicionados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                   description: Quantidade de membros adicionados (exclui duplicatas)
 *                   example: 3
 *             example:
 *               count: 3
 *       500:
 *         description: Erro ao adicionar membros
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Erro ao adicionar membros
 *                 error:
 *                   type: object
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.post('/:teamId', controller.addMembers);

/**
 * @swagger
 * /team-members/{teamId}/{userId}:
 *   delete:
 *     summary: Remove um membro de uma equipe
 *     description: |
 *       Remove um usuário específico de uma equipe.
 *       Se o usuário não for membro da equipe, a operação não causa erro.
 *     tags: [TeamMembers]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da equipe
 *         example: 1
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do usuário a ser removido
 *         example: 5
 *     responses:
 *       200:
 *         description: Membro removido com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Membro removido com sucesso
 *       500:
 *         description: Erro ao remover membro
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Erro ao remover membro
 *                 error:
 *                   type: object
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.delete('/:teamId/:userId', controller.removeMember);

module.exports = router;
