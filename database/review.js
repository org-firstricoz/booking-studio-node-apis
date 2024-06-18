const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
// Define the schema
const ReviewSchema = new mongoose.Schema({
    uuid:{
        type:String,
        required:true,
        ref:'User'
    },
    reviewId: {
        type: String,
        default: uuidv4,
        unique: true
    },
    studio_id:{
        type: String,
        required:true,
        ref:'Studio'
    },
    review: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true
    },
    time: {
        type: Date,
        default: Date.now
    }
});

// Create a model from the schema
const Review = mongoose.model('Review', ReviewSchema);

module.exports = Review;
