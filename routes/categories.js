const express = require('express');
const controller = require('../controllers/categories');
const FunctionsHelpers = require('../helpers/functions_helpers');

const router = express.Router();

router.route('/')
  .get(controller.getAll)
  .post(FunctionsHelpers.auth_check, FunctionsHelpers.access_check(['admin']), controller.createOne);
router.route('/:category_id')
  .get(controller.getOne)
  .patch(FunctionsHelpers.auth_check, FunctionsHelpers.access_check(['admin']), controller.updateOne)
  .delete(FunctionsHelpers.auth_check, FunctionsHelpers.access_check(['admin']), controller.deleteOne);
router.get('/:category_id/posts', controller.getPosts);

module.exports = router;

