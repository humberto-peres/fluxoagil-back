const express = require('express');
const router = express.Router();
const controller = require('../controllers/sprint.controller');

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/', controller.removeMany);

router.post('/:id/activate', controller.activate);
router.post('/:id/close', controller.close);

module.exports = router;
