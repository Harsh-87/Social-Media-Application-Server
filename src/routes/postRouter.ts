import express = require('express');
import bodyParser = require('body-parser');
import path = require("path");
var authenticate = require('../authenticate');
var Posts = require('../models/posts');
import multer = require("multer");
const postRouter = express.Router();

postRouter.use(bodyParser.json());

const storage = multer.diskStorage({
    destination: "public/Images",
    filename: function (req, file, cb) {
        cb(null, (req.user['_id']) + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Routes for posts
postRouter.route('/')
    .get(authenticate.verifyUser, (req, res, next) => {
        // Finds all the posts created
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
    })
    .post(authenticate.verifyUser, upload.single('image'), (req, res, next) => {
        // Creates a post by user who is running this request
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
    })
    .put(authenticate.verifyUser, (req, res, next) => {
        res.status(403);
        res.end('PUT operation not supported on /posts');
    })
    .delete(authenticate.verifyUser, (req, res, next) => {
        // Deletes all Posts
        Posts.remove({})
            .then((resp) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(resp);
            }, (err) => next(err))
            .catch((err) => next(err));
    });

postRouter.route('/:postId')
    .get(authenticate.verifyUser, (req, res, next) => {
        // Searches information about a particular post
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
    })
    .post(authenticate.verifyUser, (req, res, next) => {
        res.status(403);
        res.end('POST operation not supported on /posts/' + req.params.postId);
    })
    .put(authenticate.verifyUser, (req, res, next) => {
        // Updates this particular post using its ID
        Posts.findByIdAndUpdate(req.params.postId, {
            $set: req.body
        }, { new: true })
            .then((post) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(post);
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .delete(authenticate.verifyUser, (req, res, next) => {
        // Deletes this particular post using its ID
        Posts.findByIdAndRemove(req.params.postId)
            .then((resp) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(resp);
            }, (err) => next(err))
            .catch((err) => next(err));
    });

postRouter.route('/:postId/comments')
    .get(authenticate.verifyUser, (req, res, next) => {
        // Get all the comments on this Post
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
    })
    .post(authenticate.verifyUser, (req, res, next) => {
        // Creates a comment on this post
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
    })
    .put(authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /posts/'
            + req.params.postId + '/comments');
    })
    .delete(authenticate.verifyUser, (req, res, next) => {
        // Deletes all the comments on this post if requested by author
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
    });

postRouter.route('/:postId/comments/:commentId')
    .get(authenticate.verifyUser, (req, res, next) => {
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
    })
    .post(authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end('POST operation not supported on /posts/' + req.params.postId
            + '/comments/' + req.params.commentId);
    })
    .put(authenticate.verifyUser, (req, res, next) => {
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
    })
    .delete(authenticate.verifyUser, (req, res, next) => {
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
    });

postRouter.route('/:postId/like')
    .get(authenticate.verifyUser, async (req, res, next) => {
        // Like and Undo like on this post
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
    });

module.exports = postRouter;