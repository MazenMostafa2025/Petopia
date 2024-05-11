const express = require("express");
const productController = require('../Controllers/productController');
const authController = require('../Controllers/authController');

const router = express.Router();
router.use(authController.protect);

router.route('/')
.get(productController.getAllProducts)
.post(authController.restrictTo('admin'), productController.addProduct);

router.route('/:id')
.get(productController.getProduct)
.patch(authController.restrictTo('admin'), productController.updateProduct)
.delete(authController.restrictTo('admin'), productController.deleteProduct);

router.post('/upload_product_picture', imageMiddleware.single('productImage'));

module.exports = router;

