const express = require('express');
const controller = require('../../controllers/api/comments');
const upload = require('../../helpers/multer_upload');
const FunctionsHelpers = require('../../helpers/functions_helpers');

const router = express.Router();

router.route('/:comment_id')
  .get(controller.getOne)
  .patch(FunctionsHelpers.auth_check, FunctionsHelpers.access_check(['admin', 'author']), (req, res, next) => {
    upload.single('comment_image')(req, res, (err) => {
      return err ? res.status(415).json({ status: false, error: err }) : next();
    });
  }, controller.updateOne)
  .delete(FunctionsHelpers.auth_check, FunctionsHelpers.access_check(['admin', 'author']), controller.deleteOne);
router.route('/:comment_id/comments')
  .get(controller.getComments)
  .post(FunctionsHelpers.auth_check, (req, res, next) => {
    upload.single('comment_image')(req, res, (err) => {
      return err ? res.status(415).json({ status: false, error: err }) : next();
    });
  }, controller.createOne);
router.route('/:comment_id/like')
  .get(controller.getLikes)
  .post(FunctionsHelpers.auth_check, controller.createLike)
  .delete(FunctionsHelpers.auth_check, controller.deleteLike);
router.route('/:comment_id/answer')
  .patch(FunctionsHelpers.auth_check, controller.markAnswer);

module.exports = router;

