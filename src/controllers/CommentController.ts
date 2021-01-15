Posts = require("../models/posts");

exports.getAllComments = (req, res, next) => {
    Posts.findById(req.params.postId)
        .populate('comments.author')
        .then((post) => {
            if (post != null) {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(post.comments);
            }
            else {
                const err = new Error('Post ' + req.params.postId + ' not found');
                res.status(404);
                return next(err);
            }
        }, (err) => next(err))
        .catch((err) => next(err));
}

exports.deleteAllComments = (req, res, next) => {
    Posts.findById(req.params.postId)
        .then((post) => {
            if (post != null) {
                if (post.author !== req.user['_id']) {
                    const err = new Error('You are not authorized to delete comment of this post');
                    res.status(401);
                    return next(err);
                }

                for (var i = (post.comments.length - 1); i >= 0; i--) {
                    post.comments.id(post.comments[i]._id).remove();
                }
                post.save()
                    .then((post) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(post);
                    }, (err) => next(err));
            }
            else {
                const err = new Error('post ' + req.params.postId + ' not found');
                res.status(404);
                return next(err);
            }
        }, (err) => next(err))
        .catch((err) => next(err));
}

exports.createComment = (req, res, next) => {
    Posts.findById(req.params.postId)
        .then((post) => {
            if (post != null) {
                req.body.author = req.user['_id'];
                post.comments.push(req.body);
                post.save()
                    .then((post) => {
                        Posts.findById(post._id)
                            .populate('comments.author')
                            .then((post) => {
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'application/json');
                                res.json(post);
                            })
                    }, (err) => next(err));
            }
            else {
                const err = new Error('Post ' + req.params.postId + ' not found');
                res.status(404);
                return next(err);
            }
        }, (err) => next(err))
        .catch((err) => next(err));
}

exports.getComment = (req, res, next) => {
    Posts.findById(req.params.postId)
        .populate('comments.author')
        .then((post) => {
            if (post != null && post.comments.id(req.params.commentId) != null) {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(post.comments.id(req.params.commentId));
            }
            else if (post == null) {
                const err = new Error('post ' + req.params.postId + ' not found');
                res.status(404);
                return next(err);
            }
            else {
                const err = new Error('Comment ' + req.params.commentId + ' not found');
                res.status(404);
                return next(err);
            }
        }, (err) => next(err))
        .catch((err) => next(err));
}

exports.editComment = (req, res, next) => {
    Posts.findById(req.params.postId)
        .then((post) => {
            if (post != null && post.comments.id(req.params.commentId) != null) {
                if (!req.user['_id'].equals(post.comments.id(req.params.commentId).author)) {
                    res.statusCode = 403;
                    return next(new Error("You are not authorized to update this comment!"));
                }
                if (req.body.comment) {
                    post.comments.id(req.params.commentId).comment = req.body.comment;
                }
                post.save()
                    .then((post) => {
                        Posts.findById(post._id)
                            .populate('comments.author')
                            .then((post) => {
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'application/json');
                                res.json(post);
                            })
                    }, (err) => next(err));
            }
            else if (post == null) {
                const err = new Error('Post ' + req.params.postId + ' not found');
                res.status(404);
                return next(err);
            }
            else {
                const err = new Error('Comment ' + req.params.commentId + ' not found');
                res.status(404);
                return next(err);
            }
        }, (err) => next(err))
        .catch((err) => next(err));
}

exports.deleteComment = (req, res, next) => {
    Posts.findById(req.params.postId)
        .then((post) => {
            if (post != null && post.comments.id(req.params.commentId) != null) {
                if (!req.user['_id'].equals(post.comments.id(req.params.commentId).author)) {
                    res.statusCode = 403;
                    return next(new Error("You are not authorized to delete this comment!"));
                }
                post.comments.id(req.params.commentId).remove();
                post.save()
                    .then((post) => {
                        Posts.findById(post._id)
                            .populate('comments.author')
                            .then((post) => {
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'application/json');
                                res.json(post);
                            })
                    }, (err) => next(err));
            }
            else if (post == null) {
                const err = new Error('post ' + req.params.postId + ' not found');
                res.status(404);
                return next(err);
            }
            else {
                const err = new Error('Comment ' + req.params.commentId + ' not found');
                res.status(404);
                return next(err);
            }
        }, (err) => next(err))
        .catch((err) => next(err));
}