const express = require('express');
const controller = require('../controllers/auth');

const router = express.Router();

router.post('/register', controller.register);
router.post('/login', controller.login);
router.post('/logout', controller.logout);
router.post('/email-confirmation', controller.send_email_confirm);
router.post('/email-confirmation/:confirm_token', controller.confirm_email);
router.post('/password-reset', controller.send_password_reset);
router.post('/password-reset/:reset_token', controller.reset_password);

module.exports = router;

