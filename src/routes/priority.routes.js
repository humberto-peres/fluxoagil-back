const express = require('express');
const router = express.Router();
const controller = require('../controllers/priority.controller');

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/', controller.removeMany);

module.exports = router;
