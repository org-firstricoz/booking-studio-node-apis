const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const categorySchema = new mongoose.Schema({
    id: {
        type: String,
        default:uuidv4,
        index: { unique: true }
    },
    image: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
})

const Categories = mongoose.model('Categories', categorySchema)
module.exports = Categories;