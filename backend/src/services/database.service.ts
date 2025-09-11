import { PrismaClient } from "@prisma/client";
import { config } from "../config/env";
import { logger } from "../config/logger";

class DatabaseService {
  private static instance: DatabaseService;
  private prisma: PrismaClient;

  private constructor() {
    this.prisma = new PrismaClient({
      log: config.isDevelopment ? ["query", "info", "warn", "error"] : ["error"],
      errorFormat: "colorless",
    });
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  public getClient(): PrismaClient {
    return this.prisma;
  }

  public async connect(): Promise<void> {
    try {
      await this.prisma.$connect();
      logger.info("✅ Database connected successfully");

      // Test the connection
      await this.prisma.$queryRaw`SELECT 1`;
      logger.debug("Database health check passed");
    } catch (error) {
      logger.error("❌ Database connection failed:", error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    try {
      await this.prisma.$disconnect();
      logger.info("✅ Database disconnected successfully");
    } catch (error) {
      logger.error("❌ Database disconnection failed:", error);
      throw error;
    }
  }

  public async healthCheck(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      logger.error("Database health check failed:", error);
      return false;
    }
  }
}

export const db = DatabaseService.getInstance();
export const prisma = db.getClient();
