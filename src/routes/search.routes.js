const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function parseQuery(req) {
    const q = String(req.query.q || '').trim();
    const limit = Math.min(Math.max(parseInt(req.query.limit || '10', 10), 1), 20);
    const types = typeof req.query.types === 'string' ? req.query.types : '';
    return { q, limit, types };
}

router.get('/search', async (req, res, next) => {
    try {
        const { q, limit, types } = parseQuery(req);
        if (q.length < 2) return res.json({ results: [] });

        const wantTasks = !types || types.includes('tasks');
        const wantEpics = !types || types.includes('epics');

        const tasksPromise = wantTasks
            ? prisma.task.findMany({
                where: { title: { contains: q, mode: 'insensitive' } },
                select: { id: true, title: true, status: true, sprintId: true },
                take: limit,
            })
            : Promise.resolve([]);

        const epicsPromise = wantEpics
            ? prisma.epic.findMany({
                where: { title: { contains: q, mode: 'insensitive' } },
                select: { id: true, title: true },
                take: limit,
            })
            : Promise.resolve([]);

        const [tasks, epics] = await Promise.all([tasksPromise, epicsPromise]);

        const results = [
            ...tasks.map((t) => ({
                type: 'task',
                id: t.id,
                title: t.title,
                subtitle: t.sprintId ? `Sprint #${t.sprintId}` : 'Backlog',
                route: '/backlog',
                meta: { sprintId: t.sprintId ?? null },
            })),
            ...epics.map((e) => ({
                type: 'epic',
                id: e.id,
                title: e.title,
                subtitle: 'Épico',
                route: '/epic',
            })),
        ];

        res.json({ results });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
