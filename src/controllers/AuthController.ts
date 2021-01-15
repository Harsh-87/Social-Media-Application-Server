User = require("../models/user");

exports.Signup = (req, res, next) => {
    User.register(new User({ username: req.body.username }),
        req.body.password, (err, user) => {
            if (err) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.json({ err: err });
            }
            else {
                if (req.body.firstname)
                    user.firstname = req.body.firstname;
                if (req.body.lastname)
                    user.lastname = req.body.lastname;
                if (req.body.email)
                    user.email = req.body.email;
                user.avatar = "https://i.pravatar.cc/150?img=" + Math.floor(Math.random() * 30 + Math.random() * 30).toString();
                user.save((err, user) => {
                    if (err) {
                        res.statusCode = 500;
                        res.setHeader('Content-Type', 'application/json');
                        res.json({ err: err });
                        return;
                    }
                    passport.authenticate('local')(req, res, () => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json({ success: true, status: 'Registration Successful!', user: user });
                    });
                });
            }
        });
}

exports.Logout = (req, res, next) => {
    if (req.session) {
        req.logOut();
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({ success: true, status: 'You are successfully logged out!' });
    }
    else {
        const err = new Error('You are not logged in!');
        res.status(403);
        next(err);
    }
}

exports.Login = (req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({ success: true, status: 'You are successfully logged in!', user: req.user });
}