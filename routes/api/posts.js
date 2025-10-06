const express = require('express');
const controller = require('../../controllers/api/posts');
const upload = require('../../helpers/multer_upload');
const FunctionsHelpers = require('../../helpers/functions_helpers');

const router = express.Router();

router.route('/')
  .get(controller.getAll)
  .post(FunctionsHelpers.auth_check, (req, res, next) => {
    upload.single('post_image')(req, res, (err) => {
      return err ? res.status(415).json({ status: false, error: err }) : next();
    });
  }, controller.createOne);
router.get('/search', controller.searchByTitle);
router.get('/favorites', FunctionsHelpers.auth_check, controller.getFavorites);
router.get('/followings', FunctionsHelpers.auth_check, controller.getFollowings);
router.route('/:post_id')
  .get(controller.getOne)
  .patch(FunctionsHelpers.auth_check, FunctionsHelpers.access_check(['admin', 'author']), (req, res, next) => {
    upload.single('post_image')(req, res, (err) => {
      return err ? res.status(415).json({ status: false, error: err }) : next();
    });
  }, controller.updateOne)
  .delete(FunctionsHelpers.auth_check, FunctionsHelpers.access_check(['admin', 'author']), controller.deleteOne);
router.route('/:post_id/comments')
  .get(controller.getComments)
  .post(FunctionsHelpers.auth_check, (req, res, next) => {
    upload.single('comment_image')(req, res, (err) => {
      return err ? res.status(415).json({ status: false, error: err }) : next();
    });
  }, controller.createComment);
router.get('/:post_id/categories', controller.getCategories);
router.route('/:post_id/like')
  .get(controller.getLikes)
  .post(FunctionsHelpers.auth_check, controller.createLike)
  .delete(FunctionsHelpers.auth_check, controller.deleteLike);
router.route('/:post_id/favorite')
  .post(FunctionsHelpers.auth_check, controller.addToFavorite)
  .delete(FunctionsHelpers.auth_check, controller.deleteFromFavorite);
router.route('/:post_id/follow')
  .post(FunctionsHelpers.auth_check, controller.follow)
  .delete(FunctionsHelpers.auth_check, controller.unfollow);

module.exports = router;

