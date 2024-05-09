const crypto = require('crypto');
const mongoose = require('mongoose');
const AppError = require('../utils/appError');
// name, category, price, description, image, quantity, gender, age, breed
// category -> pet, 
const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'product must have a name'],
        trim: true,
    },
    type: {
        type: String,
        lowercase: true,
        enum: ['pet', 'need'],
        required : true
    },
    category: String,
    // categoryId: {
    //     type: mongoose.Schema.ObjectId,
    //     ref: 'Category',
    //     required: [true, 'product must have a category']
    // },
    description: {
        type: String,
        lowercase: true,
        trim: true,
    },
    // image: {
    //     type: String,
    //     required: true
    // },
    quantity: {type: Number, default: 1},
    gender: {
        type: String,
        enum: ['male', 'female'],
    },
    age: Number,
    breed: {
        type: String,
        enum: ['yes', 'no']
    },
    price: {type: Number, default: 0, required: [true, `price must be specified`]},
    sold: {type: Number, default: 0},
});

productSchema.pre('save',function (next) {
    if (this.type === 'pet')
    {
        if (!this.gender)
            return next(new AppError('gender of pet must be specified', 400));
        if (!this.age)
            return next(new AppError('age of pet must be specified', 400));
        if (!this.breed)
            return next(new AppError('breed of pet must be specified', 400));       
    }
    next();
})

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
