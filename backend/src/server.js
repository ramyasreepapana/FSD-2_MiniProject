import dotenv from 'dotenv';
import app from './app.js';
import { connectDB, disconnectDB } from './config/db.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

// Validate critical environment variables
if (!process.env.JWT_SECRET) {
  console.warn('⚠️  [Warning] JWT_SECRET is not set in environment variables! Using fallback for development.');
  process.env.JWT_SECRET = 'budgettrip_dev_fallback_jwt_secret_key_32_chars';
}

if (!process.env.MONGODB_URI) {
  console.warn('⚠️  [Warning] MONGODB_URI is not set in environment variables! Using default mongodb://localhost:27017/budgettrip');
  process.env.MONGODB_URI = 'mongodb://localhost:27017/budgettrip';
}

// Start Server
const startServer = async () => {
  try {
    // Attempt database connection
    await connectDB();
  } catch (err) {
    console.error('⚠️  [Server Warning] MongoDB connection failed on startup. Server is running in degraded health mode.');
    console.error('    Please ensure MongoDB is running or configure MONGODB_URI to a valid MongoDB Atlas connection string.');
  }

  const server = app.listen(PORT, () => {
    console.log(`🚀 [Server Running] BudgetTrip Backend listening on http://localhost:${PORT}`);
    console.log(`🏥 [Health Check] Available at http://localhost:${PORT}/api/health`);
  });

  // Graceful Shutdown
  const handleShutdown = async (signal) => {
    console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
    server.close(async () => {
      console.log('HTTP server closed.');
      await disconnectDB();
      process.exit(0);
    });

    // Force shutdown if taking longer than 10s
    setTimeout(() => {
      console.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  process.on('SIGINT', () => handleShutdown('SIGINT'));
};

startServer();
