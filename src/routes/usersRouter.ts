import express = require('express');
import bodyParser = require('body-parser');
import passport = require('passport');
const auth_controller = require("../controllers/AuthController");
const profile_controller = require("../controllers/ProfileController");

const router = express.Router();
const authenticate = require('../authenticate');
router.use(bodyParser.json());

router.get('/', authenticate.verifyUser, profile_controller.getAllProfiles);

router.post('/signup', auth_controller.Signup);

router.post('/login', passport.authenticate('local'), auth_controller.Login);

router.get('/logout', auth_controller.Logout);

module.exports = router;