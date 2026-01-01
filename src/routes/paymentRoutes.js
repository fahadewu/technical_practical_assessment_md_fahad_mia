const express = require('express');
const router = express.Router();
const { generateOTP } = require('../controllers/paymentController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/otp', authMiddleware, generateOTP);

module.exports = router;
