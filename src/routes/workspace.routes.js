const express = require('express');
const controller = require('../controllers/workspace.controller');

const router = express.Router();

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/', controller.deleteMany);

module.exports = router;
