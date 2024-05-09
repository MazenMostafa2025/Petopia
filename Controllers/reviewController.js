const factory = require('./factoryController');
const Review = require('../Models/reviewModel');

exports.createFilterObj = (req, res, next) => {
  let filterObject = {};
  if (req.params.productId) filterObject = { product: req.params.productId };
  req.filterObj = filterObject;
  next();
};

exports.getReviews = async (req, res, next) => {
    const { product_id } = req.body;
    const reviews = Review.find(product_id);
    res.status(200).json({
        status: 'success',
        data: reviews
    });
};

exports.getReview = async(req, res, next) => {
    const review = Review.findById();
};

exports.setProductIdAndUserIdToBody = (req, res, next) => {
  if (!req.body.product) req.body.product = req.params.productId;
  if (!req.body.user) req.body.user = req.user._id;
  next();
};

exports.createReview = async (req, res, next) => {
    const review = await Review.create(req.body);
    res.status(200).json({
        status : 'success',
        data: review
    });
};

exports.updateReview = async (req, res, next) => {
    const review = await Review.findByIdAndUpdate(req.params.review_id, req.body);
    if (!review)
        return console.log('no review found with this id')
    
        res.status(200).json({
        status : 'success',
        data: review
    });
};

exports.deleteReview = async (req, res, next) => {
    await Review.findByIdAndDelete(req.params.review_id);
    res.status(204).json({
        status: 'success',
        data: null
    });
};