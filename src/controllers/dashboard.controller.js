const service = require('../services/dashboard.service');

module.exports = {
  async getDashboardData(req, res) {
    try {
      const { workspaceId } = req.query;
      const userId = req.user.id;

      if (!workspaceId) {
        return res.status(400).json({ message: 'workspaceId é obrigatório' });
      }

      const data = await service.getDashboardData(Number(workspaceId), userId);
      res.json(data);
    } catch (error) {
      console.error('Dashboard error:', error);
      res.status(500).json({ 
        message: 'Erro ao buscar dados do dashboard',
        error: error.message 
      });
    }
  }
};