const mongoose = require('mongoose');

const connectDB = async (retries = 5) => {
  for (let i = 0; i < retries; i++) {
    try {
      const conn = await mongoose.connect(process.env.MONGODB_URI);
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      return;
    } catch (error) {
      console.error(`MongoDB connection attempt ${i + 1}/${retries} failed: ${error.message}`);
      if (i < retries - 1) {
        console.log('Retrying in 3 seconds...');
        await new Promise((r) => setTimeout(r, 3000));
      } else {
        console.error('Could not connect to MongoDB. Check MONGODB_URI and network/IP whitelist.');
        process.exit(1);
      }
    }
  }
};

module.exports = connectDB;
