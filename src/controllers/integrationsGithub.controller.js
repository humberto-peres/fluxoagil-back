const svc = require('../services/integrationsGithub.service');

module.exports = {
  async getByWorkspace(req, res) {
    const workspaceId = Number(req.query.workspaceId);
    const data = await svc.getByWorkspace(req.user.id, workspaceId);
    res.json(data);
  },
  async upsert(req, res) {
    const { workspaceId, repoFullName, secret } = req.body;
    const data = await svc.upsert(req.user.id, { workspaceId, repoFullName, secret });
    res.json(data);
  },
  async listRules(req, res) {
    const integrationId = Number(req.params.integrationId);
    res.json(await svc.listRules(req.user.id, integrationId));
  },
  async createRule(req, res) {
    const integrationId = Number(req.params.integrationId);
    res.json(await svc.createRule(req.user.id, integrationId, req.body));
  },
  async updateRule(req, res) {
    const ruleId = Number(req.params.ruleId);
    res.json(await svc.updateRule(req.user.id, ruleId, req.body));
  },
  async deleteRule(req, res) {
    const ruleId = Number(req.params.ruleId);
    res.json(await svc.deleteRule(req.user.id, ruleId));
  },
};
