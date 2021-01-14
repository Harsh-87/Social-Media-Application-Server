import mongoose = require('mongoose');
var Schema = mongoose.Schema;
import passportLocalMongoose = require('passport-local-mongoose');

var User = new Schema({
    firstname: {
        type: String,
        default: ''
    },
    lastname: {
        type: String,
        default: ''
    },
    email: {
        type: String,
        default: ''
    },
    avatar: {
        type: String,
        default: ''
    },
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    following: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
});

// Adds local strategy plugin to this schema which means username and password fields will be added to the above schema and will be saved in database in encrypted form
User.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', User);