const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema(
  {
    cartItems: [
      {
        product: {
          type: mongoose.Schema.ObjectId,
          ref: 'Product',
        },
        price: Number,
        quantity: {
          type: Number,
          default: 1
        } 
      },
    ],
    totalCartPrice: Number,
    totalPriceAfterDiscount: Number,
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Cart', cartSchema);