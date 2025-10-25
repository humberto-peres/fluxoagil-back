const express = require('express');
const router = express.Router();
const controller = require('../controllers/typeTask.controller');

/**
 * @swagger
 * tags:
 *   name: TaskTypes
 *   description: Gerenciamento de tipos de atividades/tarefas
 */

/**
 * @swagger
 * /task-types:
 *   get:
 *     summary: Lista todos os tipos de atividades
 *     description: Retorna todos os tipos de atividades disponíveis no sistema
 *     tags: [TaskTypes]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Lista de tipos de atividades retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TypeTask'
 *             example:
 *               - id: 1
 *                 name: Bug
 *                 createdAt: "2025-01-15T10:00:00.000Z"
 *                 updatedAt: "2025-01-15T10:00:00.000Z"
 *               - id: 2
 *                 name: Feature
 *                 createdAt: "2025-01-15T10:00:00.000Z"
 *                 updatedAt: "2025-01-15T10:00:00.000Z"
 *               - id: 3
 *                 name: Improvement
 *                 createdAt: "2025-01-15T10:00:00.000Z"
 *                 updatedAt: "2025-01-15T10:00:00.000Z"
 *               - id: 4
 *                 name: Task
 *                 createdAt: "2025-01-15T10:00:00.000Z"
 *                 updatedAt: "2025-01-15T10:00:00.000Z"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/', controller.getAll);

/**
 * @swagger
 * /task-types/{id}:
 *   get:
 *     summary: Busca um tipo de atividade por ID
 *     tags: [TaskTypes]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do tipo de atividade
 *         example: 1
 *     responses:
 *       200:
 *         description: Tipo de atividade encontrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TypeTask'
 *       404:
 *         description: Tipo de atividade não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Tipo de Atividade não encontrado
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/:id', controller.getById);

/**
 * @swagger
 * /task-types:
 *   post:
 *     summary: Cria um novo tipo de atividade
 *     description: |
 *       Cria um novo tipo de atividade no sistema.
 *       Tipos comuns: Bug, Feature, Improvement, Task, Epic, Story, etc.
 *     tags: [TaskTypes]
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
 *                 description: Nome do tipo de atividade
 *                 example: Bug
 *           examples:
 *             bug:
 *               summary: Bug (Defeito)
 *               value:
 *                 name: Bug
 *             feature:
 *               summary: Feature (Nova funcionalidade)
 *               value:
 *                 name: Feature
 *             improvement:
 *               summary: Improvement (Melhoria)
 *               value:
 *                 name: Improvement
 *             task:
 *               summary: Task (Tarefa genérica)
 *               value:
 *                 name: Task
 *             story:
 *               summary: Story (História de usuário)
 *               value:
 *                 name: Story
 *             epic:
 *               summary: Epic (Épico - não confundir com model Epic)
 *               value:
 *                 name: Epic
 *     responses:
 *       201:
 *         description: Tipo de atividade criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TypeTask'
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
 * /task-types/{id}:
 *   put:
 *     summary: Atualiza um tipo de atividade existente
 *     tags: [TaskTypes]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do tipo de atividade
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
 *                 description: Novo nome do tipo de atividade
 *                 example: Critical Bug
 *     responses:
 *       200:
 *         description: Tipo de atividade atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TypeTask'
 *       404:
 *         description: Tipo de atividade não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Tipo de Atividade não encontrado
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.put('/:id', controller.update);

/**
 * @swagger
 * /task-types:
 *   delete:
 *     summary: Remove múltiplos tipos de atividades
 *     description: |
 *       Remove permanentemente um ou mais tipos de atividades do banco de dados.
 *       ATENÇÃO: Esta operação pode falhar se houver tarefas associadas aos tipos.
 *     tags: [TaskTypes]
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
 *                 description: Array de IDs dos tipos de atividades a serem removidos
 *                 example: [1, 2, 3]
 *     responses:
 *       200:
 *         description: Tipos de atividades excluídos com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Tipos de Atividade excluídos com sucesso
 *       400:
 *         description: Nenhum ID fornecido ou IDs inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Nenhum ID fornecido
 *       500:
 *         description: Erro ao excluir tipos (possível constraint de FK)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Erro ao excluir Tipos de Atividade
 *                 error:
 *                   type: object
 *                   description: Detalhes do erro
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.delete('/', controller.deleteMany);

module.exports = router;
