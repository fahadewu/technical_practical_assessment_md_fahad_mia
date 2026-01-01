const express = require('express');
const router = express.Router();
const { generateOTP, verifyPayment } = require('../controllers/paymentController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/otp', authMiddleware, generateOTP);
router.post('/verify', authMiddleware, verifyPayment);

module.exports = router;
