const Order = require('../Models/orderModel');
const Cart = require('../Models/cartModel');
const Product = require('../Models/productModel');
const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY);
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/appError');


module.exports.createOrder = asyncHandler(async (req, res, next) => {

    const taxPrice = 0;
    const shippingPrice = 0;
    const cart = await Cart.findOne({userId: req.user._id});
    if (!cart)
        return next(new AppError('no cart for this user exist', 400));
    
    const cartPrice = cart.totalPriceAfterDiscount
    ? cart.totalPriceAfterDiscount
    : cart.totalCartPrice;

    const totalOrderPrice = cartPrice + taxPrice + shippingPrice;

    const order = await Order.create({ user: req.user._id, cartItems: cart.cartItems, totalOrderPrice });
    const bulkOption = cart.cartItems.map((item) => ({
        updateOne: {
            filter: {_id: item.product},
            update: { $inc: { quantity: -item.quantity, sold: +item.quantity} }
        },
    })
    );

    await Product.bulkWrite(bulkOption, {});
    await Cart.findByIdAndDelete(cart._id);
    
    res.status(201).json({
        status: 'success',
        data: order
    });
});



module.exports.viewAllUsersOrders = async (req, res, next) => {
    const orders = await Order.find();
    if (!orders)
        return next(new AppError('no orders were found', 400));

    res.status(200).json({
        status: 'success',
        data: orders
    });
};

module.exports.viewUserOrders = async (req, res, next) => {
    const orders = await Order.find({user: req.user._id});
    if (!orders)
        return next(new AppError('no orders were found', 400));

    res.status(200).json({
        status: 'success',
        data: orders
    });
}


module.exports.ViewDeliveredOrders = async (req, res, next) => {
    const orders = await Order.find({user: req.user._id, isDelivered: true});
    if (!orders)
        return next(new AppError('You have no delivered orders', 400));

    res.status(200).json({
        status: 'success',
        data: orders
    });
}

module.exports.ViewUnDeliveredOrders = async (req, res, next) => {
    const orders = await Order.find({user: req.user._id, isDelivered: false});
    
    if (!orders)
        return next(new AppError('You have no undelivered orders', 400));

    res.status(200).json({
        status: 'success',
        data: orders
    });
}

module.exports.viewOrder = async (req, res, next) => {
    const order = await Order.find({user: req.user._id, _id: req.params.id});
    if (!order)
        return next(new AppError('no order with this id was found', 400));

    res.status(200).json({
        status: 'success',
        data: order
    });
}



module.exports.updateOrderToPaid = async (req, res, next) => {
    // params -> order_id
    const order = Order.findById(req.params.order_id);
    if (!order)
        return next(new AppError('no order with this id was found', 400));

    order.isPaid = true;
    order.isPaidAt = Date.now();

    await order.save();
    res.status(200).json({
        status: 'success',
        data: order
    });
}

module.exports.updateOrderToDelivered = async (req, res, next) => {
    // params -> order_id
    const order = Order.findById(req.params.order_id);
    if (!order)
        return next(new AppError('no product with this id was found', 400));

    order.isDelivered = true;
    order.isDeliveredAt = Date.now();

    await order.save();
    res.status(200).json({
        status: 'success',
        data: order
    });
}

module.exports.createCheckoutSession = async (req, res, next) => {
    const {products} = req.body;
    const lineItems = products.map((product) => ({
        price_data: {
            currency: "egp",
            product_data: {
                name: product.name,
                images: [product.image]
            },
            unit_amount: product.price * 100,
            quantity: product.quantity
        }
    }));

    const session = await stripe.checkout.sessions.create({
        payment_method_type: ["card"],
        line_items: lineItems,
        mode: "payment",
        success_url: "http://localhost:3000/success",
        cancel_url: "http://localhost:3000/cancel"
    })

    res.status(200).json({
        id: session.id
    });
}

exports.checkoutSession = asyncHandler(async (req, res, next) => {
    // app settings
    const taxPrice = 0;
    const shippingPrice = 0;
  
    // 1) Get cart depend on cartId
    const cart = await Cart.findById(req.params.cartId);
    if (!cart) {
      return next(
        new AppError(`There is no such cart with id ${req.params.cartId}`, 404)
      );
    }

    // 2) Get order price depend on cart price "Check if coupon apply"
    const cartPrice = cart.totalPriceAfterDiscount
      ? cart.totalPriceAfterDiscount
      : cart.totalCartPrice;
  
    const totalOrderPrice = cartPrice + taxPrice + shippingPrice;
  
    // 3) Create stripe checkout session
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          name: req.user.name,
          amount: totalOrderPrice * 100,
          currency: 'aed',
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.protocol}://${req.get('host')}/orders`,
      cancel_url: `${req.protocol}://${req.get('host')}/cart`,
      customer_email: req.user.email,
      client_reference_id: req.params.cartId,
      metadata: req.body.shippingAddress,
    });
  
    // 4) send session to response
    res.status(200).json({ status: 'success', session });
  });



module.exports.getDashboardData = async (req, res, next) => {
    try {
        const startDate = req.query.startDate || new Date('2024-01-01');
        const endDate = req.query.endDate || new Date();
        const pipeline = [
            {
                $match: {
                    createdAt: {
                        $gte: new Date(startDate),
                        $lte: new Date(endDate)
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    totalSales: { $sum: 1 },
                    totalRevenue: { $sum: "$totalOrderPrice" },
                    totalCustomers: { $addToSet: "$user" }
                }
            }
        ];

        const [dashboardData] = await Order.aggregate(pipeline);

        const recentSales = await Order.find({
            createdAt: {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            }
        })
            .sort({ createdAt: -1 })
            .populate('user', 'username')
            .populate('cartItems.product', 'name price')
            .select('user cartItems.price isPaid isDelivered createdAt');

        const topSellingProducts = await Order.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: new Date(startDate),
                        $lte: new Date(endDate)
                    }
                }
            },
            {
                $unwind: "$cartItems"
            },
            {
                $group: {
                    _id: "$cartItems.product",
                    totalQuantitySold: { $sum: "$cartItems.quantity" }
                }
            },
            {
                $lookup: {
                    from: "products",
                    localField: "_id",
                    foreignField: "_id",
                    as: "productDetails"
                }
            },
            {
                $project: {
                    _id: 0,
                    product: "$productDetails.name",
                    image: "$productDetails.image",
                    price: "$productDetails.price",
                    totalQuantitySold: 1,
                    revenue: { $multiply: ["$totalQuantitySold", "$productDetails.price"] }
                }
            },
            {
                $sort: { totalQuantitySold: -1 }
            },
            {
                $limit: 5
            }
        ]);

        res.status(200).json({
            status: 'success',
            data: {
                dashboardData: {
                    totalSales: dashboardData.totalSales,
                    totalRevenue: dashboardData.totalRevenue,
                    totalCustomers: dashboardData.totalCustomers.length
                },
                recentSales,
                topSellingProducts
            }
        });
    } catch (err) {
        next(err);
    }
}