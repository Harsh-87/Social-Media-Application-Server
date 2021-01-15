exports.getProfile = (req, res, next) => {
    User.find({ username: req.params.username })
        .populate('followers')
        .populate('following')
        .then((user) => {
            res.status(200);
            res.setHeader('Content-Type', 'application/json');
            res.json(user);
        }, (err) => next(err))
        .catch((err) => next(err));
}

exports.getAllProfiles = (req, res, next) => {
    User.find({})
        .then((users) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(users);
        }, (err) => next(err))
        .catch((err) => next(err));
}