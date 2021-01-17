Posts = require("../models/posts");

exports.getAllComments = async (req, res, next) => {
    const post = await Posts.findById(req.params.postId).populate('comments.author');
    if (post != null) {
        next(post.comments);
    }
    else {
        res.status(404);
        next(new Error('Post ' + req.params.postId + ' not found'));
    }
}

exports.deleteAllComments = async (req, res, next) => {
    const post = await Posts.updateOne({ _id: req.params.postId }, { $set: { comments: [] } })
    if (post != null) {
        next(post);
    }
    else {
        res.status(404);
        return next(new Error('post ' + req.params.postId + ' not found'));
    }
}

exports.createComment = async (req, res, next) => {
    const post = await Posts.findById(req.params.postId);
    if (post != null) {
        req.body.author = req.user['_id'];
        post.comments.push(req.body);
        await post.save();
        next();
    }
    else {
        res.status(404);
        return next(new Error('Post ' + req.params.postId + ' not found'));
    }
}

exports.getComment = async (req, res, next) => {
    const post = await Posts.findById(req.params.postId).populate('comments.author');
    if (post != null && post.comments.id(req.params.commentId) != null) {
        next(post.comments.id(req.params.commentId));
    }
    else if (post == null) {
        res.status(404);
        return next(new Error('Post ' + req.params.postId + ' not found'));
    }
    else {
        res.status(404);
        return next(new Error('Comment ' + req.params.commentId + ' not found'));
    }
}

exports.editComment = async (req, res, next) => {
    const post = await Posts.findById(req.params.postId)
    if (post != null && post.comments.id(req.params.commentId) != null) {
        if (!req.user['_id'].equals(post.comments.id(req.params.commentId).author)) {
            res.statusCode = 403;
            return next(new Error("You are not authorized to update this comment!"));
        }
        if (req.body.comment) {
            post.comments.id(req.params.commentId).comment = req.body.comment;
            await post.save();
        }
        next();
    }
    else if (post == null) {
        res.status(404);
        return next(new Error('Post ' + req.params.postId + ' not found'));
    }
    else {
        res.status(404);
        return next(new Error('Post ' + req.params.postId + ' not found'));
    }
}

exports.deleteComment = async (req, res, next) => {
    const post = await Posts.findById(req.params.postId)
    if (post != null && post.comments.id(req.params.commentId) != null) {
        if (!req.user['_id'].equals(post.comments.id(req.params.commentId).author)) {
            res.statusCode = 403;
            return next(new Error("You are not authorized to delete this comment!"));
        }
        post.comments.id(req.params.commentId).remove();
        await post.save();
        next();
    }
    else if (post == null) {
        res.status(404);
        return next(new Error('post ' + req.params.postId + ' not found'));
    }
    else {
        res.status(404);
        return next(new Error('Comment ' + req.params.commentId + ' not found'));
    }
}