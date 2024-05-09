const express = require("express");
const router = express.Router();
const orderController = require('../Controllers/orderController');
const authController = require('../Controllers/authController');

router.use(authController.protect);
// admin view orders
router.get("/all-orders",authController.restrictTo('admin'), orderController.viewAllUsersOrders);

// View Orders
router.get("/", orderController.viewUserOrders);
router.get("/delivered", orderController.ViewDeliveredOrders);
router.get("/undelivered", orderController.ViewUnDeliveredOrders);
router.get("/:id", orderController.viewOrder);

// Create Order
router.post("/create", orderController.createOrder);

// Update Order
router.patch("/pay/:order_id",  orderController.updateOrderToPaid);
router.patch("/deliver/:order_id", orderController.updateOrderToDelivered);

// Dashboard
router.get("/dashboard", orderController.getDashboardData);

module.exports = router;