const express = require('express');
const avatarController = require('../controllers/avatarController');

const router = express.Router();


router.route('/:id')
        .get(avatarController.getAvatar)
        .delete(avatarController.removeAvatar);

router.route('/upload/:id')
        .get(avatarController.getAvatarForm)/* for testing*/
        .post(avatarController.upload.single("file"),avatarController.setAvatar);

module.exports = router;