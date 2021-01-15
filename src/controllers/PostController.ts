Posts = require("../models/posts");
exports.findAllPosts = (req, res, next) => {
    req.user['following'].push(req.user['_id']);
    Posts.find({ author: { $in: req.user['following'] } })
        .sort({ "createdAt": -1 })
        .populate('author')
        .populate('likes.author')
        .populate('comments.author')
        .then((posts) => {
            console.log(posts);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(posts);
        }, (err) => next(err))
        .catch((err) => next(err));
}

exports.deleteAllPosts = (req, res, next) => {
    Posts.remove({})
        .then((res) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(res);
        }, (err) => next(err))
        .catch((err) => next(err));
}

exports.createPost = (req, res, next) => {
    req.body.author = req.user['_id'];
    if (req.file) {
        req.body.image = req.file.path ? req.file.path.toString().slice(7) : undefined;
    } else {
        req.body.image = undefined;
    }
    const post = new Posts(req.body);
    post.save()
        .then((post) => {
            Posts.findById(post._id)
                .populate('author')
                .populate('likes.author')
                .populate('comments.author')
                .then((post) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(post);
                }, (err) => next(err))
                .catch((err) => next(err));
        }, (err) => next(err))
        .catch((err) => next(err));
}

exports.findPost = (req, res, next) => {
    Posts.findById(req.params.postId)
        .populate('author')
        .populate('likes.author')
        .populate('comments.author')
        .sort({ "comments.createdAt": -1 })
        .then((post) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(post);
        }, (err) => next(err))
        .catch((err) => next(err));
}

exports.updatePost = (req, res, next) => {
    Posts.findByIdAndUpdate(req.params.postId, {
        $set: req.body
    }, { new: true })
        .then((post) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(post);
        }, (err) => next(err))
        .catch((err) => next(err));
}

exports.deletePost = (req, res, next) => {
    Posts.findByIdAndRemove(req.params.postId)
        .then((resp) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(resp);
        }, (err) => next(err))
        .catch((err) => next(err));
}

exports.likePost = async (req, res, next) => {
    let flag = true;
    await Posts.findById(req.params.postId)
        .then(async (post) => {
            await post.likes.forEach(async element => {
                if (req.user['_id'].equals(element.author)) {
                    flag = false;
                    await Posts.findOneAndUpdate({ _id: req.params.postId }, { $pull: { likes: { author: req.user['_id'] } } }, { new: true }, function (err, post) {
                        if (err) {
                            console.log(err);
                        }
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(post);
                    }, (err) => next(err))
                        .catch((err) => next(err));
                }
            });
            if (flag) {
                req.body.author = req.user['_id'];
                post.likes.push(req.body);
                await post.save()
                    .then((post) => {
                        Posts.findById(post._id)
                            .populate('likes.author')
                            .populate('comments.author')
                            .then((post) => {
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'application/json');
                                res.json(post);
                            });
                    });
            }
        })
        .catch((err) => next(err));
}