import express = require('express');
const authenticate = require('../authenticate');
const Profile = require("../controllers/ProfileController");

const router = express.Router();

router
  .get('/', (req, res, next) => {
    res.send({ title: 'Express', description: "Welcome to Social media App" });
  });

router.get('/profile/:username', authenticate.verifyUser, Profile.getProfile);

module.exports = router;
