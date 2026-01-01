const mongoose = require('mongoose');
const { createClient } = require('redis');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error('MongoDB Connection Error:', err.message);
    // process.exit(1); // Optional: Exit process with failure
  }
};

const connectRedis = async () => {
  const client = createClient({
    url: process.env.REDIS_URL
  });

  client.on('error', (err) => console.error('Redis Client Error', err));
  client.on('connect', () => console.log('Redis Client Connected'));

  try {
    await client.connect();
    return client;
  } catch (err) {
    console.error('Redis Connection Error:', err.message);
    return null;
  }
};

module.exports = { connectDB, connectRedis };
