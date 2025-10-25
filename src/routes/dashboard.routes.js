const express = require('express');
const router = express.Router();
const controller = require('../controllers/dashboard.controller');
const { authRequired } = require('../middlewares/auth');

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Dados agregados para dashboard
 */

router.use(authRequired);

/**
 * @swagger
 * /dashboard:
 *   get:
 *     summary: Retorna todos os dados do dashboard para um workspace
 *     description: |
 *       Endpoint consolidado que retorna todas as métricas e dados necessários
 *       para renderizar o dashboard em uma única chamada.
 *     tags: [Dashboard]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do workspace
 *         example: 1
 *     responses:
 *       200:
 *         description: Dados do dashboard retornados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalTasks:
 *                   type: integer
 *                   description: Total de tarefas no workspace
 *                 completedTasks:
 *                   type: integer
 *                   description: Tarefas concluídas
 *                 overdueTasks:
 *                   type: integer
 *                   description: Tarefas atrasadas
 *                 upcomingTasks:
 *                   type: integer
 *                   description: Tarefas com prazo nos próximos 7 dias
 *                 activeSprint:
 *                   type: object
 *                   nullable: true
 *                   description: Sprint ativa no momento
 *                 myTasks:
 *                   type: array
 *                   description: Tarefas atribuídas ao usuário autenticado
 *                 tasksByStatus:
 *                   type: array
 *                   description: Distribuição de tarefas por status
 *                 tasksByPriority:
 *                   type: array
 *                   description: Distribuição de tarefas por prioridade
 *                 tasksByType:
 *                   type: array
 *                   description: Distribuição de tarefas por tipo
 *                 epicProgress:
 *                   type: array
 *                   description: Progresso dos épicos
 *                 recentActivity:
 *                   type: array
 *                   description: Atividades recentes (últimas 10 tarefas)
 *       400:
 *         description: workspaceId não fornecido
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/', controller.getDashboardData);

module.exports = router;