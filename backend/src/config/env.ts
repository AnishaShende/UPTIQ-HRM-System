import { z } from "zod";
import dotenv from "dotenv";
import path from "path";

// Load environment variables
dotenv.config();

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.string().default("3000").transform(Number),

  // Database
  DATABASE_URL: z.string().min(1, "Database URL is required"),

  // JWT
  JWT_SECRET: z.string().min(32, "JWT secret must be at least 32 characters"),
  JWT_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_SECRET: z
    .string()
    .min(32, "JWT refresh secret must be at least 32 characters"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),

  // Frontend
  FRONTEND_URL: z.string().url().default("http://localhost:5173"),

  // Email (Optional)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().default("587").transform(Number),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().email().optional(),

  // File Upload
  MAX_FILE_SIZE: z.string().default("5242880").transform(Number), // 5MB
  UPLOAD_PATH: z.string().default("./uploads"),

  // Redis (Optional)
  REDIS_URL: z.string().default("redis://localhost:6379"),

  // Logging
  LOG_LEVEL: z.enum(["error", "warn", "info", "debug"]).default("info"),
  LOG_FILE: z.string().default("logs/app.log"),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().default("900000").transform(Number), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.string().default("100").transform(Number),

  // Security
  BCRYPT_ROUNDS: z.string().default("12").transform(Number),
  COOKIE_SECRET: z
    .string()
    .min(32, "Cookie secret must be at least 32 characters")
    .optional(),

  // API
  API_VERSION: z.string().default("v1"),
  API_PREFIX: z.string().default("/api"),
});

// Validate environment variables
let env: z.infer<typeof envSchema>;

try {
  env = envSchema.parse(process.env);
} catch (error) {
  console.error("❌ Invalid environment variables:", error);
  process.exit(1);
}

export const config = {
  // App
  nodeEnv: env.NODE_ENV,
  port: env.PORT,
  isDevelopment: env.NODE_ENV === "development",
  isProduction: env.NODE_ENV === "production",
  isTest: env.NODE_ENV === "test",

  // Database
  database: {
    url: env.DATABASE_URL,
  },

  // JWT
  jwt: {
    secret: env.JWT_SECRET,
    expiresIn: env.JWT_EXPIRES_IN,
    refreshSecret: env.JWT_REFRESH_SECRET,
    refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
  },

  // Frontend
  frontend: {
    url: env.FRONTEND_URL,
  },

  // Email
  email: {
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
    from: env.SMTP_FROM || env.SMTP_USER,
    enabled: Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS),
  },

  // File Upload
  upload: {
    maxFileSize: env.MAX_FILE_SIZE,
    path: path.resolve(env.UPLOAD_PATH),
    allowedTypes: ["image/jpeg", "image/png", "image/gif", "application/pdf"],
  },

  // Redis
  redis: {
    url: env.REDIS_URL,
  },

  // Logging
  logging: {
    level: env.LOG_LEVEL,
    file: path.resolve(env.LOG_FILE),
  },

  // Rate Limiting
  rateLimit: {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
  },

  // Security
  security: {
    bcryptRounds: env.BCRYPT_ROUNDS,
    cookieSecret: env.COOKIE_SECRET,
  },

  // API
  api: {
    version: env.API_VERSION,
    prefix: env.API_PREFIX,
    baseUrl: `${env.API_PREFIX}/${env.API_VERSION}`,
  },

  // CORS
  cors: {
    origin: env.FRONTEND_URL,
    credentials: true,
  },
} as const;

export type Config = typeof config;
