const express = require('express');
const router = express.Router();
const controller = require('../controllers/typeTask.controller');

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/', controller.deleteMany);

module.exports = router;
