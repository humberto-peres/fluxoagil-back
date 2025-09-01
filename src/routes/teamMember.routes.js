const express = require('express');
const router = express.Router();
const controller = require('../controllers/teamMember.controller');

router.get('/:teamId', controller.getMembers);
router.get('/available/:teamId', controller.getAvailableUsers);
router.post('/:teamId', controller.addMembers);
router.delete('/:teamId/:userId', controller.removeMember);

module.exports = router;
