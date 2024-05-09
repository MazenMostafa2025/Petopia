const crypto = require('crypto');
const AppError = require('../utils/appError');
const jwt = require('jsonwebtoken');
const User = require('../Models/userModel');
const catchAsync = require('../utils/asyncHandler');
//const sendEmail = require('../utils/email');

const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE_IN
    });
};

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);

    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 1000 * 60 * 60 * 24),
        // secure: true,
        httpOnly: true
    };

    // if (process.env.NODE_ENV === 'production')
    //     cookieOptions.secure = true;

    res.cookie('jwt', token, cookieOptions);
    // sheel el password 3shan mtrg3sh fl json response
    user.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    });
};

const signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
//        passwordconfirm: req.body.passwordconfirm
    });
    createSendToken(newUser, 201, res);
});

const login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password)
        return next(new AppError("Please provide email and password", 400));

    const user = await User.findOne({ email }).select('+password');
    // Equivalent To User.findOne({email: email});
    // console.log(user);
    if (!user || !(await user.correctPassword(password, user.password)))
        return next(new AppError("Username or password not correct", 401));
    createSendToken(user, 200, res);
});


const protect = catchAsync(async (req, res, next) => {

    // get token and check if it's there
    let token;
    // console.log(req.headers);
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
        return next(new AppError('You are not logged in! Please login to get access.', 401));
    }

    // verification token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // console.log(decoded);
    // check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser)
        return next(new AppError('The user belonging to this token does no longer exist', 401));

    // // Grant access to the protected route 
    req.user = currentUser;
    next();
});

const restrictTo = (...roles) => {
    return (req, res, next) => {
        // roles ['admin', 'lead-guide']. role='user'
        if (!roles.includes(req.user.role))
            return next(new AppError('You do not have permission to perform this action', 403));
        next();
    }
};

module.exports = {
    signup,
    login,
    protect,
    restrictTo
}