const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * @swagger
 * tags:
 *   name: Search
 *   description: Busca global no sistema
 */

function parseQuery(req) {
    const q = String(req.query.q || '').trim();
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit || '10', 10), 1), 20);
    const types = typeof req.query.types === 'string' ? req.query.types : '';
    return { q, limit, types };
}

/**
 * @swagger
 * /search:
 *   get:
 *     summary: Busca global por tarefas e épicos
 *     description: Realiza busca por título e identificador em tarefas e épicos. Retorna até 20 resultados combinados por tipo.
 *     tags: [Search]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 2
 *         description: Termo de busca (mínimo 2 caracteres)
 *         example: login
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 20
 *           default: 10
 *         description: Número máximo de resultados por tipo
 *         example: 10
 *       - in: query
 *         name: types
 *         schema:
 *           type: string
 *         description: Tipos de recursos a buscar separados por vírgula (tasks, epics). Se omitido, busca todos os tipos.
 *         example: tasks,epics
 *     responses:
 *       200:
 *         description: Resultados da busca retornados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     oneOf:
 *                       - type: object
 *                         properties:
 *                           type:
 *                             type: string
 *                             example: task
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           title:
 *                             type: string
 *                             example: Criar endpoint de login
 *                           idTask:
 *                             type: string
 *                             example: PROJ-1
 *                           subtitle:
 *                             type: string
 *                             example: Sprint #1
 *                           route:
 *                             type: string
 *                             example: /backlog
 *                           meta:
 *                             type: object
 *                             properties:
 *                               sprintId:
 *                                 type: integer
 *                                 nullable: true
 *                                 example: 1
 *                       - type: object
 *                         properties:
 *                           type:
 *                             type: string
 *                             example: epic
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           title:
 *                             type: string
 *                             example: Implementar autenticação
 *                           key:
 *                             type: string
 *                             example: PROJ-1
 *                           subtitle:
 *                             type: string
 *                             example: PROJ-1
 *                           route:
 *                             type: string
 *                             example: /epic
 *             example:
 *               results:
 *                 - type: task
 *                   id: 1
 *                   title: Criar endpoint de login
 *                   idTask: PROJ-1
 *                   subtitle: Sprint #1
 *                   route: /backlog
 *                   meta:
 *                     sprintId: 1
 *                 - type: task
 *                   id: 5
 *                   title: Implementar tela de login
 *                   idTask: PROJ-5
 *                   subtitle: Backlog
 *                   route: /backlog
 *                   meta:
 *                     sprintId: null
 *                 - type: epic
 *                   id: 1
 *                   title: Implementar autenticação
 *                   key: PROJ-1
 *                   subtitle: PROJ-1
 *                   route: /epic
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/search', async (req, res, next) => {
    try {
        const { q, limit, types } = parseQuery(req);
        if (q.length < 2) return res.json({ results: [] });

        const wantTasks = !types || types.includes('tasks');
        const wantEpics = !types || types.includes('epics');

        const tasksPromise = wantTasks
            ? prisma.task.findMany({
                where: {
                    OR: [
                        { title: { contains: q, mode: 'insensitive' } },
                        { idTask: { contains: q, mode: 'insensitive' } },
                    ],
                },
                select: { id: true, title: true, status: true, sprintId: true, idTask: true },
                take: limit,
            })
            : Promise.resolve([]);

        const epicsPromise = wantEpics
            ? prisma.epic.findMany({
                where: {
                    OR: [
                        { title: { contains: q, mode: 'insensitive' } },
                        { key: { contains: q, mode: 'insensitive' } },
                    ],
                },
                select: { id: true, title: true, key: true },
                take: limit,
            })
            : Promise.resolve([]);

        const [tasks, epics] = await Promise.all([tasksPromise, epicsPromise]);

        const results = [
            ...tasks.map((t) => ({
                type: 'task',
                id: t.id,
                title: t.title,
                idTask: t.idTask,
                subtitle: t.sprintId ? `Sprint #${t.sprintId}` : 'Backlog',
                route: '/backlog',
                meta: { sprintId: t.sprintId ?? null },
            })),
            ...epics.map((e) => ({
                type: 'epic',
                id: e.id,
                title: e.title,
                key: e.key,
                subtitle: e.key,
                route: '/epic',
            })),
        ];

        res.json({ results });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
