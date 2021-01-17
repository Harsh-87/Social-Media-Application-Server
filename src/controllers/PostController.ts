Posts = require("../models/posts");
exports.findAllPosts = async (req, res, next) => {
    req.user['following'].push(req.user['_id']);
    const posts = await Posts.find({ author: { $in: req.user['following'] } })
        .sort({ "createdAt": -1 })
        .populate('author')
        .populate('likes.author')
        .populate('comments.author');
    next(posts);
}

exports.deleteAllPosts = async (req, res, next) => {
    const post = await Posts.remove({});
    next(post);
}

exports.createPost = async (req, res, next) => {
    req.body.author = req.user['_id'];
    if (req.file) {
        req.body.image = req.file.path ? req.file.path.toString().slice(7) : undefined;
    } else {
        req.body.image = undefined;
    }
    const post = new Posts(req.body);
    await post.save();
    req.params.postId = post._id;
    next();
}

exports.findPost = async (req, res, next) => {
    const post = await Posts.findById(req.params.postId).populate('author').populate('likes.author').populate('comments.author')
    next(post);
}

exports.updatePost = async (req, res, next) => {
    const post = await Posts.findByIdAndUpdate(req.params.postId, { $set: req.body }, { new: true });
    next(post);
}

exports.deletePost = async (req, res, next) => {
    const post = await Posts.findByIdAndRemove(req.params.postId)
    next(post);
}

exports.likePost = async (req, res, next) => {
    let flag = true;
    const post = await Posts.findById(req.params.postId);
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
}