const express = require('express');
const controller = require('../controllers/notifications');
const FunctionsHelpers = require('../helpers/functions_helpers');

const router = express.Router();

router.get('/', FunctionsHelpers.auth_check, controller.getAll);
router.get('/unread', FunctionsHelpers.auth_check, controller.getUnread);
router.patch('/:notification_id/read', FunctionsHelpers.auth_check, controller.updateOne);

module.exports = router;

