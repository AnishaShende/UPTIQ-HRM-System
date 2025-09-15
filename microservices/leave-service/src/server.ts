import app from './app';
import { createLogger } from '@hrm/shared';

const logger = createLogger('leave-service');
const PORT = process.env.PORT || 3003;

async function startServer() {
  try {
    app.listen(PORT, () => {
      logger.info(`🚀 Leave Service is running on port ${PORT}`, {
        port: PORT,
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString(),
      });
      
      logger.info(`📚 API Documentation available at http://localhost:${PORT}/api-docs`);
      
      // Log available routes
      logger.info('📝 Available routes:');
      logger.info(`   GET    /health - Health check`);
      logger.info(`   GET    /api-docs - API Documentation`);
      logger.info(`   *      /api/v1/leaves - Leave management endpoints`);
      logger.info(`   *      /api/v1/leave-types - Leave type management endpoints`);
      logger.info(`   *      /api/v1/leave-balances - Leave balance management endpoints`);
    });
  } catch (error) {
    logger.error('❌ Failed to start Leave Service:', error);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('💥 Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('👋 SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('👋 SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

startServer();
