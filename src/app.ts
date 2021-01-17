import express = require('express');
import createError = require('http-errors');
import path = require('path');
import logger = require('morgan');
import passport = require('passport');
import session = require('express-session');
import mongoose = require("mongoose");

const config = require('./config');
const connectionRouter = require('./routes/connectionRouter')
const indexRouter = require('./routes/indexRouter');
const postRouter = require('./routes/postRouter');
const usersRouter = require('./routes/usersRouter');

const app = express();

const url = config.mongoUrl;
const connect = mongoose.connect(url);
connect.then((db) => {
    console.log("Connected correctly to server");
}, (err) => { console.log(err); });

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set('views', __dirname + '/views');

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
    res.status(res.statusCode || 500);
    res.send(err.message);
});

const port = 5000;
app.listen(port, () => {
    return console.log(`Server is listening on ${port}`);
});
