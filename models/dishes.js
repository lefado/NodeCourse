// MONGOOSE


// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

require('mongoose-currency').loadType(mongoose);
var Currency = mongoose.Types.Currency;

var commentSchema = new Schema({
    rating:  {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
    comment:  {
        type: String,
        required: true
    },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId, //Reference to the user id
        ref: 'User'
    }
}, {
    timestamps: true
});

// create a schema
var Dish = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    image: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },    
    label: {
        type: String,
        default: "",
        required: true
    },
    price: {
        type: Currency,
        required: true
    },
    featured: {
        type: Boolean,
        default:false
    },
    description: {
        type: String,
        required: true
    },
    comments:[commentSchema]
}, {
    timestamps: true
});

// the schema is useless so far
// we need to create a model using it
var Dishes = mongoose.model('Dish', Dish);

// make this available to our Node applications
module.exports = Dishes;