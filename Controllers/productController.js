const Product = require('../Models/productModel');

module.exports.getAllProducts = async (req, res, next) => {

    // Pets?price[lte]=2000&price[gte]=1000
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(el => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
    
    let query = Product.find(JSON.parse(queryStr));

    //SORTING

    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    }
    else
        query = query.sort('-createdAt');

    if (req.query.fields) {
        const fields = req.query.fields.split(',').join(' ');
        query = query.select(fields);
    } else {
        query = query.select('-__v');
    } 


    const queryPage = req.query.page * 1 || 1;
    const page = queryPage;
    const queryLimit = req.query.limit * 1 || 10;
    const limit = queryLimit;
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);
    if (req.query.page) {
        const numPets = await Product.countDocuments();
        if (skip >= numPets || req.query.page < 1)
            throw new Error('Pet controller get All error: this page does not exist');
    }

    const Products = await query;

    res.status(200).json({
    status: 'success',
    data: Products
})
}

module.exports.getProduct = async (req, res, next) => {
    const id = req.params.id;
    const product  = await Product.findById(id);
    if (!product)
        next(new appError('no product with this id was found', 400));

    res.status(200).json({
        status: 'success',
        data: product
    });
}

module.exports.addProduct = async (req, res, next) => {
    const product = await Product.create(req.body);

    res.status(201).json({
        status: 'success',
        data: product
    });
};

module.exports.updateProduct = async (req, res, next) => {

    const updateBody = req.body;
    const id = req.params.id;
    const product = await Product.findByIdAndUpdate(id, updateBody, { new: true});
    if (!product)
        next(new appError('no product with this id was found', 400));

    res.status(200).json({
        status: 'success',
        data: product
    });
};

module.exports.deleteProduct = async (req, res, next) => {

    const id = req.params.id;
    await Product.findByIdAndDelete(id);
     
    res.status(204).json({
        status: 'success',
        data: null
    });
};

