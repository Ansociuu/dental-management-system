const mongoose = require('mongoose');

/**
 * Kết nối đến MongoDB Atlas
 * Sử dụng biến môi trường MONGODB_URI từ file .env
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
