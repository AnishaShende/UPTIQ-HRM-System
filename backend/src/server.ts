import { createServer } from "http";
import app from "./app";
import { config } from "@/config/env";
import { logger } from "@/config/logger";
import { db } from "@/config/database";

// Create HTTP server
const server = createServer(app);

// Server startup function
async function startServer(): Promise<void> {
  try {
    // Connect to database
    await db.connect();
    logger.info("✅ Database connection established");

    // Start the server
    server.listen(config.port, () => {
      logger.info(`🚀 Server is running on port ${config.port}`);
      logger.info(`� Environment: ${config.nodeEnv}`);
      logger.info(
        `�📚 API Documentation: http://localhost:${config.port}/api-docs`
      );
      logger.info(`🏥 Health Check: http://localhost:${config.port}/health`);
      logger.info(
        `🔗 API Base URL: http://localhost:${config.port}${config.api.baseUrl}`
      );
    });

    // Log startup completion
    logger.info("✅ Server startup completed successfully");
  } catch (error) {
    logger.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

// Graceful shutdown function
async function shutdown(signal: string): Promise<void> {
  logger.info(`${signal} received, starting graceful shutdown...`);

  // Close HTTP server
  server.close(async (err) => {
    if (err) {
      logger.error("Error closing HTTP server:", err);
      process.exit(1);
    }

    logger.info("✅ HTTP server closed");

    try {
      // Disconnect from database
      await db.disconnect();
      logger.info("✅ Database disconnected");

      logger.info("✅ Graceful shutdown completed");
      process.exit(0);
    } catch (error) {
      logger.error("❌ Error during graceful shutdown:", error);
      process.exit(1);
    }
  });

  // Force close after 10 seconds
  setTimeout(() => {
    logger.error(
      "⚠️ Could not close connections in time, forcefully shutting down"
    );
    process.exit(1);
  }, 10000);
}

// Handle process signals
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception:", err);
  shutdown("UNCAUGHT_EXCEPTION");
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at:", promise, "reason:", reason);
  shutdown("UNHANDLED_REJECTION");
});

// Start the server
if (require.main === module) {
  startServer();
}

export { server, startServer };
export default app;
