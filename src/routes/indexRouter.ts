import express = require('express');
var router = express.Router();
var authenticate = require('../authenticate');
const Profile = require("../controllers/ProfileController");

router
  .get('/', (req, res, next) => {
    res.send({ title: 'Express', description: "Welcome to Social media App" });
  });

router.get('/profile/:username', authenticate.verifyUser, Profile.getProfile);

module.exports = router;
