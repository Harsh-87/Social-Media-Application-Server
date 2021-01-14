import express = require('express');
var router = express.Router();
var authenticate = require('../authenticate');
var User = require("../models/user");

router.get('/:id/follow', authenticate.verifyUser, function (req, res, next) {
    User.findById(req.user['_id'])
        .then((user) => {
            user.following.push(req.params.id);
            user.save()
                .then((user) => {
                    res.status(200);
                    res.setHeader('Content-Type', 'application/json');
                    res.json(user);
                });
        }, (err) => next(err))
        .catch((err) => next(err));

    User.findById(req.params.id)
        .then((user) => {
            user.followers.push(req.user['_id']);
            user.save()
                .then((user) => {
                    res.status(200);
                    res.setHeader('Content-Type', 'application/json');
                    res.json(user);
                });
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

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({ success: true });
});

module.exports = router;
