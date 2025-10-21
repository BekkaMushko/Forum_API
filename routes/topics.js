const express = require('express');
const controller = require('../controllers/topics');
const FunctionsHelpers = require('../helpers/functions_helpers');

const router = express.Router();

router.route('/')
  .get(controller.getAll)
  .post(FunctionsHelpers.auth_check, FunctionsHelpers.access_check(['admin']), controller.createOne);
router.route('/:topic_id')
  .get(controller.getOne)
  .patch(FunctionsHelpers.auth_check, FunctionsHelpers.access_check(['admin']), controller.updateOne)
  .delete(FunctionsHelpers.auth_check, FunctionsHelpers.access_check(['admin']), controller.deleteOne);
router.get('/:topic_id/posts', controller.getPosts);
router.route('/:topic_id/categories')
  .get(controller.getCategories)
  .post(FunctionsHelpers.auth_check, FunctionsHelpers.access_check(['admin']), controller.connectCategory)
  .delete(FunctionsHelpers.auth_check, FunctionsHelpers.access_check(['admin']), controller.disconnectCategory);
router.get('/:topic_id/categories/is-connected', FunctionsHelpers.auth_check, FunctionsHelpers.access_check(['admin']), controller.isCategoryConnected);

module.exports = router;

