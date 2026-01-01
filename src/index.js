require('dotenv').config();
const express = require('express');
const { connectDB, connectRedis } = require('./config/db');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to Databases
connectDB();
const redisClient = connectRedis();

app.use(express.json());

app.use('/auth', require('./routes/authRoutes'));

app.get('/', (req, res) => {
    res.send('API is running...');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
