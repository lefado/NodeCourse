var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = require('../models/user');
var Verify = require('./verify');

/* GET users listing. */
router.get('/', Verify.verifyAdmin, function (req, res, next) {
    User.find({}, function (err, user) { //Return all the dishes //function (err, dish) is a callback function
        if (err)
            throw err;
        res.json(user);
    });
});

//Register a new user
router.post('/register', function (req, res) {
    User.register(new User({username: req.body.username}),
            req.body.password, function (err, user) {
                if (err) {
                    return res.status(500).json({err: err});
                }
                if (req.body.firstname) { //Save firstanme
                    user.firstname = req.body.firstname;
                }
                if (req.body.lastname) { //Save lastname
                    user.lastname = req.body.lastname;
                }
                user.save(function (err, user) { //Save user object
                    passport.authenticate('local')(req, res, function () {
                        return res.status(200).json({status: 'Registration Successful!'});
                    });
                });
            });
});

//loging of a user
router.post('/login', function (req, res, next) {
    passport.authenticate('local', function (err, user, info) {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.status(401).json({
                err: info
            });
        }
        req.logIn(user, function (err) {
            if (err) {
                return res.status(500).json({
                    err: 'Could not log in user'
                });
            }

            var token = Verify.getToken({"username":user.username, "_id":user._id, "admin":user.admin});
            res.status(200).json({
                status: 'Login successful!',
                success: true,
                token: token
            });
        });
    })(req, res, next);
});

router.get('/logout', function (req, res) {
    req.logout();
    res.status(200).json({
        status: 'Bye2!'
    });
});

module.exports = router;