import { PrismaClient } from "@prisma/client";
import { logger } from "./logger";
import { config } from "./env";

// Custom Prisma client with logging configuration
export const prisma = new PrismaClient({
  log: [
    {
      emit: "event",
      level: "query",
    },
    {
      emit: "event",
      level: "error",
    },
    {
      emit: "event",
      level: "info",
    },
    {
      emit: "event",
      level: "warn",
    },
  ],
  errorFormat: "pretty",
});

// Set up Prisma event listeners
if (config.isDevelopment) {
  prisma.$on("query", (e: any) => {
    logger.debug("Prisma Query", {
      query: e.query,
      params: e.params,
      duration: `${e.duration}ms`,
      target: e.target,
    });
  });
}

prisma.$on("error", (e: any) => {
  logger.error("Prisma Error", {
    target: e.target,
    message: e.message,
  });
});

prisma.$on("info", (e: any) => {
  logger.info("Prisma Info", {
    target: e.target,
    message: e.message,
  });
});

prisma.$on("warn", (e: any) => {
  logger.warn("Prisma Warning", {
    target: e.target,
    message: e.message,
  });
});

// Database connection management
export class DatabaseManager {
  private static instance: DatabaseManager;
  private connected = false;

  static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  async connect(): Promise<void> {
    try {
      await prisma.$connect();
      this.connected = true;
      logger.info("✅ Database connected successfully");

      // Test database connection
      await this.healthCheck();
    } catch (error) {
      logger.error("❌ Database connection failed:", error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await prisma.$disconnect();
      this.connected = false;
      logger.info("✅ Database disconnected successfully");
    } catch (error) {
      logger.error("❌ Database disconnection failed:", error);
      throw error;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      await prisma.$queryRaw`SELECT 1`;
      logger.debug("Database health check passed");
      return true;
    } catch (error) {
      logger.error("Database health check failed:", error);
      return false;
    }
  }

  isConnected(): boolean {
    return this.connected;
  }

  async executeInTransaction<T>(fn: (tx: any) => Promise<T>): Promise<T> {
    return prisma.$transaction(fn, {
      maxWait: 5000, // 5 seconds
      timeout: 10000, // 10 seconds
    });
  }
}

// Export singleton instance
export const db = DatabaseManager.getInstance();

// Graceful shutdown handlers
process.on("SIGINT", async () => {
  logger.info("Received SIGINT, closing database connection...");
  await db.disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  logger.info("Received SIGTERM, closing database connection...");
  await db.disconnect();
  process.exit(0);
});

// Handle process exit
process.on("beforeExit", async () => {
  if (db.isConnected()) {
    await db.disconnect();
  }
});

export default prisma;
