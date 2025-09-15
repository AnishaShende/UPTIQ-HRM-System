import 'dotenv/config';
import app from './app';
import { createLogger } from '@hrm/shared';

const logger = createLogger('payroll-service');
const PORT = process.env.PORT || 3004;

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: any) => {
  logger.error('Unhandled rejection:', reason);
  process.exit(1);
});

// Graceful shutdown
const gracefulShutdown = (signal: string) => {
  logger.info(`${signal} received. Starting graceful shutdown...`);
  
  // Close server
  server.close(() => {
    logger.info('HTTP server closed');
    
    // Add any cleanup logic here (database connections, etc.)
    process.exit(0);
  });

  // Force close after 30 seconds
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 30000);
};

const server = app.listen(PORT, () => {
  logger.info(`Payroll service running on port ${PORT}`);
  logger.info(`Health check: http://localhost:${PORT}/health`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

export default server;
