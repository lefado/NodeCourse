// MONGOOSE


// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var favoriteSchema = new Schema({
    dishes: [{
            type: mongoose.Schema.Types.ObjectId, //Reference to the user id
            ref: 'Dish'
        }], 
    postedBy: {
        type: mongoose.Schema.Types.ObjectId, //Reference to the user id
        ref: 'User',
//        unique: true
    }
}, {
    timestamps: true
});

// the schema is useless so far
// we need to create a model using it
var Favourites = mongoose.model('Favourite', favoriteSchema);

// make this available to our Node applications
module.exports = Favourites;
