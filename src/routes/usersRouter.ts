import express = require('express');
var router = express.Router();
import bodyParser = require('body-parser');
var User = require("../models/user");
import passport = require('passport');
var authenticate = require('../authenticate');

router.use(bodyParser.json());

/* GET users listing. */
router.get('/', authenticate.verifyUser, function (req, res, next) {
  User.find({})
    .then((users) => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(users);
    }, (err) => next(err))
    .catch((err) => next(err));
});

router.post('/signup', (req, res, next) => {
  User.register(new User({ username: req.body.username }),
    req.body.password, (err, user) => {
      if (err) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.json({ err: err });
      }
      else {
        if (req.body.firstname)
          user.firstname = req.body.firstname;
        if (req.body.lastname)
          user.lastname = req.body.lastname;
        if (req.body.email)
          user.email = req.body.email;
        user.avatar = "https://i.pravatar.cc/150?img=" + Math.floor(Math.random() * 30 + Math.random() * 30).toString();
        user.save((err, user) => {
          if (err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.json({ err: err });
            return;
          }
          passport.authenticate('local')(req, res, () => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json({ success: true, status: 'Registration Successful!', user: user });
          });
        });
      }
    });
});

router.post('/login', passport.authenticate('local'), (req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json({ success: true, status: 'You are successfully logged in!', user: req.user });
});

router.get('/logout', (req, res, next) => {
  if (req.session) {
    req.logOut();
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({ success: true, status: 'You are successfully logged out!' });
  }
  else {
    const err = new Error('You are not logged in!');
    res.status(403);
    next(err);
  }
});

module.exports = router;