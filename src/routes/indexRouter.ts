import express = require('express');
var router = express.Router();
var authenticate = require('../authenticate');
var User = require("../models/user");

router.get('/', (req, res, next) => {
  res.send({ title: 'Express', description: "Welcome to Social media App" });
});

router.get('/profile/:username', authenticate.verifyUser, function (req, res, next) {
  User.find({ username: req.params.username })
    .then((user) => {
      res.status(200);
      res.setHeader('Content-Type', 'application/json');
      res.json(user);
    }, (err) => next(err))
    .catch((err) => next(err));
});

module.exports = router;
