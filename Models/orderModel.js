const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Order must belong to a user']
    },
    cartItems: [{
        product: {
            type:mongoose.Schema.ObjectId,
            ref: 'Product',
        },
        quantity: Number,
        price: Number
    }],
    taxPrice: {
        type: Number,
        default: 0
    },
    shippingPrice: {
        type: Number,
        default: 0
    },
    totalOrderPrice: Number,
    paymentMethodType: {
        type: String,
        enum: ['card', 'cash'],
        default: 'cash'
    },
    isPaid: {
        type: Boolean,    
        default: false
    },
    paidAt: Date,
    isDelivered: {
        type: Boolean,
        default: false
    },
    deliveredAt: Date
},
{
    timestamps: true
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;