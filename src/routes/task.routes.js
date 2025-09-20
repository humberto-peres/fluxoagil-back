const express = require('express');
const router = express.Router();
const controller = require('../controllers/task.controller');

router.get('/all', controller.getAllTasks);
router.get('/', controller.getTasks);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/', controller.removeMany);
router.put('/:id/move', controller.move);

module.exports = router;
