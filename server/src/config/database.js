import mongoose from 'mongoose';

let isConnected = false;

const connectDB = async () => {
  // If already connected, skip
  if (isConnected) {
    console.log('📦 Using existing MongoDB connection');
    return;
  }

  try {
    // Get MongoDB URI from environment or use MongoDB Atlas free tier demo
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/healthsync';

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
    });

    isConnected = true;
    console.log(`📦 MongoDB Connected: ${conn.connection.host}`);

    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.log('⚠️ Running without database - some features may not work');
    // Don't exit, allow server to run for UI testing
    return null;
  }
};

export default connectDB;
