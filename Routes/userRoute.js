const express = require('express');
const authController = require('../Controllers/authController');
const router = express.Router();
const imageMiddleware = require('../utils/imageMiddleware');


router.post('/signup', authController.signup);
router.post('/login', authController.login);

router.post('upload_avatar', authController.protect, imageMiddleware.single('avatar'));

module.exports = router;