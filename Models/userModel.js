const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'The user must have a name'],
        trim: true,  
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        lowercase: true, // 
        unique: true,
        trim: true,
        validate: [validator.isEmail, 'please provide a valid email'] 
    },
    image: String,
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    password: {
        type: String,
        required: [true, 'Please enter your password'],
        minlength: 8,
        select: false
    },
    // passwordconfirm: {
    //     type: String,
    //     required: [true, 'Please confirm your password'],
    //     validate: {
    //         // this only works on User.create that creates a user and User.save that updates user 
    //         validator: function (el) {
    //             return el === this.password;
    //         },
    //         message: 'Passwords are not the same'
    //     }
    // },
});

userSchema.pre('save', async function (next) {
    // only run this function if password was modified
    if (!this.isModified('password'))
        return next();
    // hash the passwod with cost of 12
    this.password = await bcrypt.hash(this.password, 12);
    // delete the password confirm field
    // this.passwordconfirm = undefined;
    next();
});

userSchema.pre('find', function (next) {
    this.find({ active: {$ne: false} });
    // {$ne: false} equivalent to true but we did this bec. there were rows that didn't have the active property
    next();
});

userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model('User', userSchema);

module.exports = User;  