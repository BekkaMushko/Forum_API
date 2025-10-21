const express = require('express');
const controller = require('../controllers/users');
const upload = require('../helpers/multer_upload');
const FunctionsHelpers = require('../helpers/functions_helpers');

const router = express.Router();

router.route('/')
  .get(FunctionsHelpers.auth_check, FunctionsHelpers.access_check(['admin']), controller.getAll)
  .post(FunctionsHelpers.auth_check, FunctionsHelpers.access_check(['admin']), controller.createOne);
router.route('/avatar')
  .patch(FunctionsHelpers.auth_check, (req, res, next) => {
    upload.single('avatar')(req, res, (err) => {
      return err ? res.status(415).json({ status: false, error: err }) : next();
    });
  }, controller.uploadProfilePicture)
  .delete(FunctionsHelpers.auth_check, controller.deleteProfilePicture);
router.get('/followings', FunctionsHelpers.auth_check, controller.getFollowings);
router.route('/:user_id')
  .get(controller.getOne)
  .patch(FunctionsHelpers.auth_check, FunctionsHelpers.access_check(['admin', 'me']), controller.updateOne)
  .delete(FunctionsHelpers.auth_check, FunctionsHelpers.access_check(['admin', 'me']), controller.deleteOne);
router.route('/:user_id/follow')
  .get(FunctionsHelpers.auth_check, controller.isFollowed)
  .post(FunctionsHelpers.auth_check, controller.follow)
  .delete(FunctionsHelpers.auth_check, controller.unfollow);
router.get('/:user_id/ratings', controller.getRatings);

module.exports = router;

