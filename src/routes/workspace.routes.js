const express = require('express');
const controller = require('../controllers/workspace.controller');
const { authRequired } = require('../middlewares/auth');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Workspaces
 *   description: Gerenciamento de workspaces (projetos/áreas de trabalho)
 */

router.use(authRequired);

/**
 * @swagger
 * /workspaces/allowed:
 *   get:
 *     summary: Lista workspaces permitidos para o usuário autenticado
 *     description: |
 *       Retorna apenas os workspaces onde o usuário é membro da equipe.
 *       Útil para listar projetos disponíveis no menu/sidebar.
 *     tags: [Workspaces]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Lista de workspaces permitidos
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
 *                     example: Projeto Principal
 *                   methodology:
 *                     type: string
 *                     example: Scrum
 *                   key:
 *                     type: string
 *                     example: PROJ
 *             example:
 *               - id: 1
 *                 name: Projeto Principal
 *                 methodology: Scrum
 *                 key: PROJ
 *               - id: 2
 *                 name: Website Institucional
 *                 methodology: Kanban
 *                 key: WEB
 *       500:
 *         description: Erro ao buscar workspaces do usuário
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Erro ao buscar workspaces do usuário
 *                 error:
 *                   type: string
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/allowed', controller.getAllowedForUser);

/**
 * @swagger
 * /workspaces/{id}/can-access:
 *   get:
 *     summary: Verifica se o usuário tem acesso ao workspace
 *     description: |
 *       Verifica se o usuário autenticado é membro da equipe do workspace.
 *       Útil para controle de acesso antes de carregar dados do workspace.
 *     tags: [Workspaces]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do workspace
 *         example: 1
 *     responses:
 *       200:
 *         description: Resultado da verificação de acesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 allowed:
 *                   type: boolean
 *                   description: true se o usuário tem acesso, false caso contrário
 *             examples:
 *               hasAccess:
 *                 summary: Usuário tem acesso
 *                 value:
 *                   allowed: true
 *               noAccess:
 *                 summary: Usuário não tem acesso
 *                 value:
 *                   allowed: false
 *       500:
 *         description: Erro ao checar acesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Erro ao checar acesso
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/:id/can-access', controller.canAccess);

/**
 * @swagger
 * /workspaces:
 *   get:
 *     summary: Lista todos os workspaces
 *     description: |
 *       Retorna todos os workspaces com suas equipes, membros e etapas configuradas.
 *       Útil para administração geral do sistema.
 *     tags: [Workspaces]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Lista de workspaces retornada com sucesso
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
 *                     example: Projeto Principal
 *                   key:
 *                     type: string
 *                     example: PROJ
 *                   methodology:
 *                     type: string
 *                     example: Scrum
 *                   teamId:
 *                     type: integer
 *                     example: 1
 *                   teamName:
 *                     type: string
 *                     example: Time de Desenvolvimento
 *                   members:
 *                     type: array
 *                     items:
 *                       type: string
 *                     description: Nomes dos membros da equipe
 *                     example: ["João Silva", "Maria Santos"]
 *                   steps:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         stepId:
 *                           type: integer
 *                         name:
 *                           type: string
 *                         order:
 *                           type: integer
 *                     example:
 *                       - stepId: 1
 *                         name: A Fazer
 *                         order: 1
 *                       - stepId: 2
 *                         name: Em Desenvolvimento
 *                         order: 2
 *       500:
 *         description: Erro ao buscar workspaces
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Erro ao buscar workspaces
 *                 error:
 *                   type: object
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/', controller.getAll);

/**
 * @swagger
 * /workspaces/{id}:
 *   get:
 *     summary: Busca um workspace por ID
 *     description: Retorna um workspace específico com suas etapas configuradas
 *     tags: [Workspaces]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do workspace
 *         example: 1
 *     responses:
 *       200:
 *         description: Workspace encontrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Workspace'
 *                 - type: object
 *                   properties:
 *                     steps:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           order:
 *                             type: integer
 *                           workspaceId:
 *                             type: integer
 *                           stepId:
 *                             type: integer
 *                           step:
 *                             $ref: '#/components/schemas/Step'
 *       404:
 *         description: Workspace não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Workspace não encontrado
 *       500:
 *         description: Erro ao buscar workspace
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/:id', controller.getById);

/**
 * @swagger
 * /workspaces:
 *   post:
 *     summary: Cria um novo workspace
 *     description: |
 *       Cria um novo workspace com suas etapas de workflow.
 *       
 *       VALIDAÇÕES:
 *       - A chave (key) deve ter de 1 a 5 letras apenas
 *       - Não pode haver etapas duplicadas
 *       - A chave é convertida para maiúsculas automaticamente
 *     tags: [Workspaces]
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
 *               - methodology
 *               - teamId
 *               - key
 *               - steps
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nome do workspace
 *                 example: Projeto Principal
 *               methodology:
 *                 type: string
 *                 description: Metodologia utilizada
 *                 example: Scrum
 *               teamId:
 *                 type: integer
 *                 description: ID da equipe responsável
 *                 example: 1
 *               key:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 5
 *                 pattern: '^[A-Za-z]{1,5}$'
 *                 description: Código único do workspace (1 a 5 letras, sem números ou caracteres especiais)
 *                 example: PROJ
 *               steps:
 *                 type: array
 *                 minItems: 1
 *                 description: Lista de etapas do workflow
 *                 items:
 *                   type: object
 *                   required:
 *                     - stepId
 *                     - order
 *                   properties:
 *                     stepId:
 *                       type: integer
 *                       description: ID da etapa
 *                     order:
 *                       type: integer
 *                       description: Ordem da etapa no workflow
 *                 example:
 *                   - stepId: 1
 *                     order: 1
 *                   - stepId: 2
 *                     order: 2
 *                   - stepId: 3
 *                     order: 3
 *                   - stepId: 4
 *                     order: 4
 *           examples:
 *             scrumWorkspace:
 *               summary: Workspace Scrum
 *               value:
 *                 name: Projeto Principal
 *                 methodology: Scrum
 *                 teamId: 1
 *                 key: PROJ
 *                 steps:
 *                   - stepId: 1
 *                     order: 1
 *                   - stepId: 2
 *                     order: 2
 *                   - stepId: 3
 *                     order: 3
 *                   - stepId: 4
 *                     order: 4
 *             kanbanWorkspace:
 *               summary: Workspace Kanban
 *               value:
 *                 name: Website Institucional
 *                 methodology: Kanban
 *                 teamId: 2
 *                 key: WEB
 *                 steps:
 *                   - stepId: 1
 *                     order: 1
 *                   - stepId: 2
 *                     order: 2
 *                   - stepId: 4
 *                     order: 3
 *     responses:
 *       201:
 *         description: Workspace criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Workspace'
 *       400:
 *         description: Erro de validação
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               invalidKey:
 *                 summary: Chave inválida
 *                 value:
 *                   message: "Código inválido: use apenas letras (1 a 5)."
 *               duplicateSteps:
 *                 summary: Etapas duplicadas
 *                 value:
 *                   message: Etapas duplicadas não são permitidas
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.post('/', controller.create);

/**
 * @swagger
 * /workspaces/{id}:
 *   put:
 *     summary: Atualiza um workspace existente
 *     description: |
 *       Atualiza dados de um workspace. As etapas antigas são removidas e as novas são criadas.
 *       
 *       IMPORTANTE: A atualização de steps é destrutiva - remove todas as antigas e cria novas.
 *     tags: [Workspaces]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do workspace
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
 *                 example: Projeto Principal Atualizado
 *               methodology:
 *                 type: string
 *                 example: Scrum
 *               teamId:
 *                 type: integer
 *                 example: 1
 *               key:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 5
 *                 pattern: '^[A-Za-z]{1,5}$'
 *                 description: Nova chave (1 a 5 letras)
 *                 example: MAIN
 *               steps:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     stepId:
 *                       type: integer
 *                     order:
 *                       type: integer
 *                 example:
 *                   - stepId: 1
 *                     order: 1
 *                   - stepId: 2
 *                     order: 2
 *                   - stepId: 3
 *                     order: 3
 *     responses:
 *       200:
 *         description: Workspace atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Workspace'
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
 * /workspaces:
 *   delete:
 *     summary: Remove múltiplos workspaces
 *     description: |
 *       Remove permanentemente um ou mais workspaces do banco de dados.
 *       ATENÇÃO: Esta operação é cascata e pode remover dados relacionados.
 *     tags: [Workspaces]
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
 *                 description: Array de IDs dos workspaces a serem removidos
 *                 example: [1, 2]
 *     responses:
 *       200:
 *         description: Workspaces excluídos com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Workspaces excluídos com sucesso
 *       500:
 *         description: Erro ao excluir workspaces
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Erro ao excluir workspaces
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.delete('/', controller.deleteMany);

module.exports = router;
