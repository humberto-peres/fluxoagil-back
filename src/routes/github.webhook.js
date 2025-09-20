const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const prisma = new PrismaClient();

function verifySignature(secret, payloadBuf, signatureHeader) {
  const expected = 'sha256=' + crypto.createHmac('sha256', secret).update(payloadBuf).digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signatureHeader || ''));
  } catch {
    return false;
  }
}

function extractTaskKeys(text) {
  const re = /\b([A-Z]{1,5}-\d+)\b/g;
  const found = new Set();
  let m;
  const t = (text || '').toUpperCase();
  while ((m = re.exec(t))) found.add(m[1]);
  return Array.from(found);
}

async function moveTasksByKey({ idTasks, workspaceId, moveToStepId }) {
  if (!moveToStepId) return;
  const tasks = await prisma.task.findMany({
    where: { workspaceId: Number(workspaceId), idTask: { in: idTasks } },
    select: { id: true },
  });
  if (tasks.length === 0) return;
  await prisma.task.updateMany({
    where: { id: { in: tasks.map(t => t.id) } },
    data: { stepId: Number(moveToStepId), status: String(moveToStepId) },
  });
}

async function applyRule({ rule, integration, event, body }) {
  const cond = rule.conditionsJson || {};
  const act = rule.actionJson || {};

  if (event === 'pull_request') {
    const pr = body.pull_request;
    if (!pr) return;

    if (cond.state && pr.state !== cond.state) return;
    if (cond.merged !== undefined && pr.merged !== cond.merged) return;
    if (cond.base && pr.base?.ref !== cond.base) return;
    if (cond.label) {
      const hasLabel = (pr.labels || []).some(l => l.name === cond.label);
      if (!hasLabel) return;
    }

    const text = [pr.title, pr.head?.ref, pr.body].filter(Boolean).join(' ');
    const keys = extractTaskKeys(text);
    if (keys.length === 0) return;

    await moveTasksByKey({
      idTasks: keys,
      workspaceId: integration.workspaceId,
      moveToStepId: act.moveToStepId,
    });
  }

  // Exemplos futuros: push/check_suite/workflow_run...
}

module.exports = async function githubWebhook(req, res) {
  const event = req.get('x-github-event');
  const delivery = req.get('x-github-delivery');
  const signature = req.get('x-hub-signature-256');
  const payloadBuf = req.rawBody;
  const body = req.body;

  if (!event || !delivery) return res.status(400).json({ message: 'Cabeçalhos inválidos' });

  const repoFullName = body?.repository?.full_name;
  if (!repoFullName) return res.status(400).json({ message: 'Repo ausente' });

  const already = await prisma.webhookEventLog.findUnique({ where: { deliveryId: String(delivery) } });
  if (already) return res.json({ ok: true, duplicate: true });

  const integrations = await prisma.integrationGithub.findMany({
    where: { repoFullName },
    include: { rules: { where: { active: true } }, workspace: true },
  });
  if (integrations.length === 0) {
    await prisma.webhookEventLog.create({ data: { provider: 'github', deliveryId: String(delivery), handled: true } });
    return res.json({ ok: true, noIntegration: true });
  }

  const valid = integrations.some(int => verifySignature(int.secret, payloadBuf, signature));
  if (!valid) return res.status(401).json({ message: 'Assinatura inválida' });

  await prisma.webhookEventLog.create({ data: { provider: 'github', deliveryId: String(delivery) } });

  for (const int of integrations) {
    const rules = int.rules.filter(r => r.event === event);
    for (const rule of rules) {
      await applyRule({ rule, integration: int, event, body });
    }
  }

  await prisma.webhookEventLog.update({
    where: { deliveryId: String(delivery) },
    data: { handled: true },
  });

  res.json({ ok: true });
};
