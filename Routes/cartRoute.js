const express = require("express");
const router = express.Router();
const cartController = require('../Controllers/cartController');
const authController = require('../Controllers/authController');

router.use(authController.protect);



router.route('/')
.post(cartController.addItem)
.get(cartController.getItems)
.delete(cartController.deleteCart);



router.route('/:itemId')
.put(cartController.updateCartItemQuantity)
.delete(cartController.removeItem);

module.exports = router;