var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var Verify = require('./verify');

var Favorites = require('../models/favorites');

var favoritRouter = express.Router();
favoritRouter.use(bodyParser.json());


favoritRouter.route('/')
        .get(Verify.verifyOrdinaryUser, function (req, res, next) {
            Favorites.findOne({"postedBy": req.decoded._doc._id})
                    .populate('dishes')
                    .populate('postedBy')
                    .exec(function (err, favorite) {
                        if (err)
                            throw err;
                        res.json(favorite);
                    });
        })

        .post(Verify.verifyOrdinaryUser, function (req, res, next) {
            var dishObjectId = req.body._id;
            Favorites.findOne({postedBy: req.decoded._doc._id})
                    .exec(function (err, favorite) {
                        if (err)
                            return next(err);
                        if (!favorite) {
                            Favorites.create({
                                postedBy: req.decoded._doc._id,
                                dishes: [dishObjectId]
                            }, function (err, createdFavorite) {
                                if (err)
                                    return next(err);
                                res.json(createdFavorite)
                            })
                        } else {
                            favorite.dishes.push(dishObjectId);
                            favorite.save(function (err, savedFavorite) {
                                if (err)
                                    return next(err);
                                res.json(savedFavorite);
                            });
                        }
                    });
        })

        .delete(Verify.verifyOrdinaryUser, function (req, res, next) {
            Favorites.findOneAndRemove({postedBy: req.decoded._doc._id}, function (err, resp) {
                if (err)
                    return next(err);
                res.json(resp);
            });
        });

favoritRouter.route('/:dishObjectId')
        .all(Verify.verifyOrdinaryUser)
        .delete(function (req, res, next) {
            Favorites.findOne({postedBy: req.decoded._doc._id})
                    .exec(function (err, favorite) {
                        if (err)
                            return next(err);
                        if (!favorite) {
                            return res.status(404).json({
                                err: 'There are no favorite dishes for user ' + req.decoded._doc.username
                            });
                        } else {
                            var index = favorite.dishes.indexOf(req.params.dishObjectId);
                            if (index === -1) {
                                return res.status(404).json({
                                    err: 'Dish with id ' + req.params.dishObjectId + ' is not a favorite for user ' + req.decoded._doc.username
                                });
                            } else {
                                favorite.dishes.splice(index, 1);
                                if (favorite.dishes.length > 0) {
                                    favorite.save(function (err, savedFavorite) {
                                        if (err)
                                            return next(err);
                                        res.json(savedFavorite);
                                    })
                                } else {
                                    Favorites.remove({postedBy: req.decoded._doc._id}, function (err, resp) {
                                        if (err)
                                            return next(err);
                                        res.json(resp);
                                    });
                                }
                            }
                        }
                    });
        });

module.exports = favoritRouter;
