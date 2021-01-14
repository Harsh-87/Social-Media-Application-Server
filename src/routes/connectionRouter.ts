import express = require('express');
var router = express.Router();
var authenticate = require('../authenticate');
var User = require("../models/user");

router.get('/:id/follow', authenticate.verifyUser, async function (req, res, next) {
    await User.findById(req.user['_id'])
        .then(async (user) => {
            user.following.push(req.params.id);
            await user.save();
        }, (err) => next(err))
        .catch((err) => next(err));

    await User.findById(req.params.id)
        .then(async (user) => {
            user.followers.push(req.user['_id']);
            await user.save();
        }, (err) => next(err))
        .catch((err) => next(err));

    await User.find({})
        .then((users) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(users);
        }, (err) => next(err))
        .catch((err) => next(err));
});

router.get('/:id/unfollow', authenticate.verifyUser, async function (req, res, next) {
    await User.findOneAndUpdate({ _id: req.user['_id'] }, { $pull: { following: { $in: [req.params.id] } } }, { new: true }, function (err, user) {
        if (err) {
            console.log(err);
        }
    }, (err) => next(err))
        .catch((err) => next(err));

    await User.findOneAndUpdate({ _id: req.params.id }, { $pull: { followers: { $in: [req.user['_id']] } } }, { new: true }, function (err, user) {
        if (err) {
            console.log(err);
        }
    }, (err) => next(err))
        .catch((err) => next(err));

    await User.find({})
        .then((users) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(users);
        }, (err) => next(err))
        .catch((err) => next(err));
});

module.exports = router;
