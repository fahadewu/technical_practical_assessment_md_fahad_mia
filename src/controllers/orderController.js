const Order = require('../models/Order');
const { connectRedis } = require('../config/db');

const getMyOrders = async (req, res) => {
    try {
        const userId = req.user.id;
        const cacheKey = `orders:${userId}`;

        const redisClient = await connectRedis();
        if (!redisClient) {
            return res.status(500).json({ message: 'Redis connection failed' });
        }

        // Check Cache
        const cachedOrders = await redisClient.get(cacheKey);
        if (cachedOrders) {
            console.log('Serving from Cache');
            await redisClient.disconnect();
            return res.json(JSON.parse(cachedOrders));
        }

        console.log('Serving from MongoDB');
        // Fetch from DB
        const orders = await Order.find({ userId });

        // Store in Cache for 60 seconds
        await redisClient.set(cacheKey, JSON.stringify(orders), {
            EX: 60
        });

        await redisClient.disconnect();

        res.json(orders);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

const createOrder = async (req, res) => {
    try {
        const { amount } = req.body;
        const userId = req.user.id;

        const order = new Order({
            userId,
            amount,
            status: 'PENDING'
        });

        await order.save();
        res.status(201).json(order);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

module.exports = { getMyOrders, createOrder };
