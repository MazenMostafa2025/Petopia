const crypto = require('crypto');
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'category must have a name'],
        trim: true,
    },
    categoryId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Category',
        required: [true, 'product must have a category']
    },
});


const Category = mongoose.model('Category', categorySchema);

module.exports = Category;