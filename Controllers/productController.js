const Product = require('../Models/productModel');
const AppError = require('../utils/appError');
const { indexProduct, deleteProductFromIndex } = require('../utils/elasticProduct');

// Search products using Elasticsearch with advanced features
module.exports.searchProducts = async (req, res, next) => {
    const { q, minPrice, maxPrice, category, sort, size = 10, from = 0 } = req.query;
    
    if (!q) {
        throw new AppError('Missing search query', 400);
    }

    const redisClient = require('../utils/redisClient');
    const elasticClient = require('../utils/elasticsearch');
    // Create a unique cache key based on all search params
    const cacheKey = `search:${q}:${minPrice || ''}:${maxPrice || ''}:${category || ''}:${sort || ''}:${size}:${from}`;
    try {
        // Try to get cached result
        const cached = await redisClient.get(cacheKey);
        if (cached) {
            const parsed = JSON.parse(cached);
            return res.status(200).json(parsed);
        }
        // Build the query body
        const queryBody = {
            from: parseInt(from),
            size: parseInt(size),
            query: {
                bool: {
                    must: [
                        {
                            multi_match: {
                                query: q,
                                fields: [
                                    'name^4',
                                    'breed^3',
                                    'category^2',
                                    'description'
                                ],
                                type: 'best_fields',
                                fuzziness: 'AUTO',
                                prefix_length: 2,
                                minimum_should_match: '75%'
                            }
                        }
                    ],
                    filter: [],
                    should: [
                        {
                            match_phrase: {
                                name: {
                                    query: q,
                                    boost: 2
                                }
                            }
                        }
                    ]
                }
            },
            highlight: {
                fields: {
                    name: {},
                    description: {}
                }
            }
        };
        if (minPrice || maxPrice) {
            queryBody.query.bool.filter.push({
                range: {
                    price: {
                        gte: minPrice ? Number(minPrice) : undefined,
                        lte: maxPrice ? Number(maxPrice) : undefined
                    }
                }
            });
        }
        if (category) {
            queryBody.query.bool.filter.push({
                term: { category: category.toLowerCase() }
            });
        }
        if (sort) {
            queryBody.sort = sort.split(',').map(field => {
                const [name, order] = field.split(':');
                return { [name]: { order: order || 'asc' } };
            });
        }
        const result = await elasticClient.search({
            index: 'products',
            ...queryBody
        });
        const hits = result.hits.hits.map(hit => ({
            id: hit._id,
            ...hit._source,
            score: hit._score,
            highlights: hit.highlight
        }));
        const response = {
            status: 'success',
            results: hits.length,
            total: result.hits.total.value,
            data: hits
        };
        // Cache the result for 60 seconds
        await redisClient.setEx(cacheKey, 60, JSON.stringify(response));
        res.status(200).json(response);
    } catch (err) {
        console.error('Elasticsearch search error:', err);
        res.status(500).json({ status: 'error', message: 'Search failed' });
    }
};

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
        next(new AppError('no product with this id was found', 400));

    res.status(200).json({
        status: 'success',
        data: product
    });
}

module.exports.addProduct = async (req, res, next) => {
    const product = await Product.create(req.body);
    // Index in Elasticsearch
    indexProduct(product);
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
        next(new AppError('no product with this id was found', 400));
    // Update in Elasticsearch
    indexProduct(product);
    res.status(200).json({
        status: 'success',
        data: product
    });
};

module.exports.deleteProduct = async (req, res, next) => {
    const id = req.params.id;
    await Product.findByIdAndDelete(id);
    // Remove from Elasticsearch
    deleteProductFromIndex(id);
    res.status(204).json({
        status: 'success',
        data: null
    });
};

