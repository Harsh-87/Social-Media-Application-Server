import express = require('express');
import bodyParser = require('body-parser');
import path = require("path");
import multer = require("multer");
const authenticate = require('../authenticate');
const post_controller = require("../controllers/PostController");
const comment_controller = require("../controllers/CommentController");
const not_supported_controller = require("../controllers/NotSupportedController");

const postRouter = express.Router();
postRouter.use(bodyParser.json());
const storage = multer.diskStorage({
    destination: "public/Images",
    filename: function (req, file, cb) {
        cb(null, (req.user['_id']) + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

postRouter.route('/')
    .get(authenticate.verifyUser, post_controller.findAllPosts)
    .post(authenticate.verifyUser, upload.single('image'), post_controller.createPost)
    .put(authenticate.verifyUser, not_supported_controller.notSupported)
    .delete(authenticate.verifyUser, post_controller.deleteAllPosts);

postRouter.route('/:postId')
    .get(authenticate.verifyUser, post_controller.findPost)
    .post(authenticate.verifyUser, not_supported_controller.notSupported)
    .put(authenticate.verifyUser, post_controller.updatePost)
    .delete(authenticate.verifyUser, post_controller.deletePost);

postRouter.route('/:postId/comments')
    .get(authenticate.verifyUser, comment_controller.getAllComments)
    .post(authenticate.verifyUser, comment_controller.createComment)
    .put(authenticate.verifyUser, not_supported_controller.notSupported)
    .delete(authenticate.verifyUser, comment_controller.deleteAllComments);

postRouter.route('/:postId/comments/:commentId')
    .get(authenticate.verifyUser, comment_controller.getComment)
    .post(authenticate.verifyUser, not_supported_controller.notSupported)
    .put(authenticate.verifyUser, comment_controller.editComment)
    .delete(authenticate.verifyUser, comment_controller.deleteComment);

postRouter.route('/:postId/like')
    .get(authenticate.verifyUser, post_controller.likePost);

module.exports = postRouter;