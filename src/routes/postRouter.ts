import express = require('express');
import bodyParser = require('body-parser');
import path = require("path");
import multer = require("multer");
const authenticate = require('../authenticate');
const post_controller = require("../controllers/PostController");
const comment_controller = require("../controllers/CommentController");
const common_controller = require("../controllers/commonController");

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
    .get(authenticate.verifyUser, post_controller.findAllPosts, common_controller.handleResponse)
    .post(authenticate.verifyUser, upload.single('image'), post_controller.createPost, post_controller.findPost, common_controller.handleResponse)
    .put(authenticate.verifyUser, common_controller.notSupported)
    .delete(authenticate.verifyUser, post_controller.deleteAllPosts, common_controller.handleResponse);

postRouter.route('/:postId')
    .get(authenticate.verifyUser, post_controller.findPost, common_controller.handleResponse)
    .post(authenticate.verifyUser, common_controller.notSupported)
    .put(authenticate.verifyUser, post_controller.updatePost, common_controller.handleResponse)
    .delete(authenticate.verifyUser, post_controller.deletePost, common_controller.handleResponse);

postRouter.route('/:postId/comments')
    .get(authenticate.verifyUser, comment_controller.getAllComments, common_controller.handleResponse)
    .post(authenticate.verifyUser, comment_controller.createComment, post_controller.findPost, common_controller.handleResponse)
    .put(authenticate.verifyUser, common_controller.notSupported)
    .delete(authenticate.verifyUser, comment_controller.deleteAllComments, common_controller.handleResponse);

postRouter.route('/:postId/comments/:commentId')
    .get(authenticate.verifyUser, comment_controller.getComment, common_controller.handleResponse)
    .post(authenticate.verifyUser, common_controller.notSupported)
    .put(authenticate.verifyUser, comment_controller.editComment, post_controller.findPost, common_controller.handleResponse)
    .delete(authenticate.verifyUser, comment_controller.deleteComment, post_controller.findPost, common_controller.handleResponse);

postRouter.route('/:postId/like')
    .get(authenticate.verifyUser, post_controller.likePost);

module.exports = postRouter;