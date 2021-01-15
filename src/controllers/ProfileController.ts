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

exports.followRequest = async function (req, res, next) {
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
}

exports.unfollowRequest = async function (req, res, next) {
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
}