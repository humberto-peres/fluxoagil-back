const router = require('express').Router();
const ctrl = require('../controllers/auth.controller');
const { authRequired } = require('../middlewares/auth');

router.post('/login', ctrl.login);
router.get('/me', authRequired, ctrl.me);
router.post('/logout', authRequired, ctrl.logout);

module.exports = router;
