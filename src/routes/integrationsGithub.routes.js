const express = require('express');
const { authRequired } = require('../middlewares/auth');
const ctrl = require('../controllers/integrationsGithub.controller');

const router = express.Router();
router.use(authRequired);

router.get('/', ctrl.getByWorkspace);
router.post('/', ctrl.upsert);

router.get('/:integrationId/rules', ctrl.listRules);
router.post('/:integrationId/rules', ctrl.createRule);
router.patch('/rules/:ruleId', ctrl.updateRule);
router.delete('/rules/:ruleId', ctrl.deleteRule);

module.exports = router;
