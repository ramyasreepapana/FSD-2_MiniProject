import mongoose from 'mongoose';

/**
 * Connect to MongoDB database via Mongoose
 * Reads MONGODB_URI from environment variables and validates it.
 */
export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    const errorMsg = 'MONGODB_URI environment variable is missing. Please set it in your .env file.';
    console.error(`❌ [Database Error] ${errorMsg}`);
    throw new Error(errorMsg);
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      autoIndex: true,
    });

    console.log(`✅ [MongoDB Connected] Host: ${conn.connection.host}, Database: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`❌ [MongoDB Connection Error] Failed to connect to MongoDB: ${error.message}`);
    throw error;
  }
};

/**
 * Return current Mongoose connection status description
 */
export const getDatabaseStatus = () => {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  return states[mongoose.connection.readyState] || 'unknown';
};

/**
 * Handle graceful shutdown of MongoDB connection
 */
export const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('🔌 [MongoDB] Connection closed successfully.');
  } catch (error) {
    console.error(`❌ [MongoDB Disconnect Error] ${error.message}`);
  }
};
