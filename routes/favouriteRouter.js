//NODE-EXPRESS

var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var Favourites = require('../models/favourites');
var Verify = require('./verify');
var favouriteRouter = express.Router(); //Express router
var mongo = require('mongodb');
var ObjectID = mongo.ObjectID;

favouriteRouter.use(bodyParser.json());
favouriteRouter.route('/')

        .get(Verify.verifyOrdinaryUser, function (req, res, next) {
            var userID = req.decoded._doc._id;
            Favourites.find({'postedBy': userID})
                    .populate('postedBy') //Include the user info 
                    .populate('dishes') //Include dish info
                    .exec(function (err, favourite) {
                        if (err)
                            throw err;
                        res.json(favourite);
                    });
        })

        .post(Verify.verifyOrdinaryUser, function (req, res, next) {
            var userID = req.decoded._doc._id;
            console.log(userID);
            Favourites.findOne({'postedBy': userID})
                    .exec(function (err, dish) {
                        if (err)
                            throw err;
//                        console.log(exist);
                        if (dish != null) {//Already exist favourite for that user
                            console.log('exist')

                            //Check if the dish already exists in the array
                            flag = false;

                            for (var i = 0; i < dish.dishes.length; i++) {

                                if (dish.dishes[i] == req.body._id) {
                                    flag = true;
                                    res.json('This Dish already exists in favourites');
                                }
                            }
                            if (!flag) {
                                dish.dishes.push(req.body);
                                dish.save(function (err, dish) {
                                    if (err)
                                        throw err;
                                    res.json(dish);
                                });
                            }


                        } else { //Create favourite for the dish
                            console.log('no exist')

                            req.body.postedBy = userID; //Id of the user
                            req.body.dishes = req.body._id;
                            req.body._id = new ObjectID(); //Generate Id for the new favourite
//                            req.body._id = '1111wwwww'

                            console.log(req.body._id);

                            Favourites.create(req.body, function (err, favourite) {
                                if (err)
                                    throw err;

                                res.json(favourite);
                            });
                        }
                    });

        })


        .delete(Verify.verifyOrdinaryUser, function (req, res, next) {
            var userID = req.decoded._doc._id;
            Favourites.remove({'postedBy': userID}, function (err, resp) {
                if (err)
                    throw err;
                res.json(resp);
            });
        });

favouriteRouter.route('/:dishId')

        .delete(Verify.verifyOrdinaryUser, function (req, res, next) {

            var userID = req.decoded._doc._id;
            Favourites.findOne({'postedBy': userID}, function (err, favourite) {
                if (err)
                    throw err;
                console.log(req.params.dishId)
                console.log(favourite)

                for (var i = 0; i < favourite.dishes.length; i++) {

                    if (favourite.dishes[i] == req.params.dishId) {
                        favourite.dishes.splice(i,1);
                        favourite.save(function (err, resp) {
                            if (err)
                                throw err;
                            res.json(resp);
                        });
//                                    res.json('Dish '+ req.params.dishId +' deleted from favourites');
                    }
                }

            });
        });
module.exports = favouriteRouter;