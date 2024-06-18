const { text } = require('body-parser');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const Review = require('./review')
// Define schema
const studioSchema = new mongoose.Schema({
    rent: {
        type: Number,
        required: true

    },
    id: {
        type: String,
        default: uuidv4,
        unique: true,
        text: true
    },
    category: {
        type: String,
        required: true,
        text: true
    },
    rating: {
        type: Number,
        default: 0
    },
    // numberOfReviews: {
    //     type: Number,
    //     required: true,
    //     default:0
    // },
    name: {
        type: String,
        required: true,
        text: true
    },
    location: {
        type: String,
        required: true,
        text: true
    },
    address: {
        type: String,
        required: true,
        text: true
    },
    tags: {
        type: [String],
        required: true,
        text: true
    },
    description: {
        type: String,
        required: true,
        text: true
    },
    frontImage: {
        type: [Buffer],
        required: true
    },
    gallery: {
        type: [Buffer],
        required: true
    },
    image: {
        type: Buffer,
        required: true,
    },
    latitude: {
        type: Number,
        required: true
    },
    longitude: {
        type: Number,
        required: true
    },
    agents: {
        type: [String],
        required: true,
        text: true,
    },
    status: { type: String, default: "pending" },
}, { toJSON: { virtuals: true } });

studioSchema.virtual('numberOfReviews', {
    ref: 'Review', // Reference to the Review model
    localField: 'id', // Field in the Studio model
    foreignField: 'studio_id', // Field in the Review model
    count: true // Set to true to enable counting
})
studioSchema.index({ location: "text", address: "text", description: "text", category: "text", name: "text" })
// Create model
const Studio = mongoose.model('Studio', studioSchema);

module.exports = Studio;
