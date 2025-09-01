const express = require('express');
const router = express.Router();
const controller = require('../controllers/task.controller');

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/', controller.removeMany);
router.patch('/:id/move', controller.move);

module.exports = router;
