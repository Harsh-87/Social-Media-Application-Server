import mongoose = require('mongoose');
const Schema = mongoose.Schema;

const likeSchema = new Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

const commentSchema = new Schema({
    comment: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

const postSchema = new Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String,
        default:''
    },
    likes: [likeSchema],
    comments: [commentSchema]
}, {
    timestamps: true
});

const Posts = mongoose.model('Post', postSchema);

module.exports = Posts;
