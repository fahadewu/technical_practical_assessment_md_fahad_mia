const { connectRedis } = require('../config/db');
const nodemailer = require('nodemailer');
const User = require('../models/User');

const generateOTP = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const email = user.email;
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Store OTP in Redis with 120 seconds expiration
        const redisClient = await connectRedis();
        if (redisClient) {
            await redisClient.set(email, otp, {
                EX: 120
            });
            // We don't want to keep the connection open for every request in a real app, 
            // but for this simple setup, we'll just use it. 
            // Ideally, we should reuse a single connection instance.
            // However, connectRedis creates a new client each time. 
            // Let's assume for this task it's acceptable or we should refactor db.js to export a singleton.
            // Given the constraints and previous code, I'll use it as is but close it after use or keep it if needed.
            // Actually, the previous db.js implementation of connectRedis returns a new client and connects it.
            // So we should probably close it after use to avoid too many connections, or better, refactor to use a singleton.
            // For now, to stick to the plan and simplicity, I will use it and disconnect.
            // Wait, redis v4 client.connect() returns a promise.
            // Let's just use it and disconnect.
            await redisClient.disconnect();
        } else {
            return res.status(500).json({ message: 'Redis connection failed' });
        }

        // Send OTP via Email
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your OTP Code',
            text: `Your OTP code is ${otp}. It expires in 2 minutes.`
        };

        await transporter.sendMail(mailOptions);

        res.json({ message: 'OTP sent successfully' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

module.exports = { generateOTP };
