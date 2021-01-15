import express = require('express');
import createError = require('http-errors');
import path = require('path');
import logger = require('morgan');
import passport = require('passport');
import session = require('express-session');
import multer = require("multer");
var authenticate = require('./authenticate');
var config = require('./config');
import mongoose = require("mongoose");

// Requiring routes 
var connectionRouter = require('./routes/connectionRouter')
var indexRouter = require('./routes/indexRouter');
var postRouter = require('./routes/postRouter');
var usersRouter = require('./routes/usersRouter');

const app = express();

// Setting up DB using mongoose
const url = config.mongoUrl;
const connect = mongoose.connect(url);
connect.then((db) => {
    console.log("Connected correctly to server");
}, (err) => { console.log(err); });

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set('views', __dirname + '/views');

// passport auth
app.use(session({
    secret: "Littlesecret",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/', indexRouter);
app.use('/connections', connectionRouter);
app.use('/users', usersRouter);
app.use('/posts', postRouter);

app.use(function (req, res, next) {
    next(createError(404));
});

app.use(function (err, req, res, next) {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    res.status(res.statusCode || 500);
    res.send(err.message);
});

const port = 5000;
app.listen(port, () => {
    return console.log(`Server is listening on ${port}`);
});
