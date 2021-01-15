import express = require('express');
const router = express.Router();
const authenticate = require('../authenticate');
const profile_controller = require("../controllers/ProfileController");

router.get('/:id/follow', authenticate.verifyUser, profile_controller.followRequest);

router.get('/:id/unfollow', authenticate.verifyUser, profile_controller.unfollowRequest);

module.exports = router;
