import mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Creating Schema for likes
var likeSchema = new Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Creating Schema for comments
var commentSchema = new Schema({
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

// Creating Schema for Posts
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
    likes: [likeSchema],
    comments: [commentSchema]
}, {
    timestamps: true
});

var Posts = mongoose.model('Post', postSchema);

module.exports = Posts;
