const express = require('express');
const controller = require('../controllers/workspace.controller');
const { authRequired } = require('../middlewares/auth');

const router = express.Router();

router.use(authRequired);

router.get('/allowed', controller.getAllowedForUser);

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/', controller.deleteMany);

module.exports = router;
