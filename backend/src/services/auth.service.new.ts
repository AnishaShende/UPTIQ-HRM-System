import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import { UserRole } from "@prisma/client";
import { prisma } from "../lib/database";
import { config } from "../config/env";
import { logger } from "../config/logger";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  role?: UserRole;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
}

class AuthService {
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, config.security.bcryptRounds);
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  generateTokens(payload: TokenPayload): AuthTokens {
    const tokenPayload = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role
    };

    if (!config.jwt.secret || !config.jwt.refreshSecret) {
      throw new Error("JWT secrets are not configured");
    }

    const accessToken = jwt.sign(
      tokenPayload,
      config.jwt.secret,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      tokenPayload,
      config.jwt.refreshSecret,
      { expiresIn: "7d" }
    );

    return { accessToken, refreshToken };
  }

  verifyAccessToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, config.jwt.secret!) as TokenPayload;
    } catch (error: any) {
      logger.warn("Invalid access token", { error: error?.message });
      throw new Error("Invalid access token");
    }
  }

  verifyRefreshToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, config.jwt.refreshSecret!) as TokenPayload;
    } catch (error: any) {
      logger.warn("Invalid refresh token", { error: error?.message });
      throw new Error("Invalid refresh token");
    }
  }

  async register(data: RegisterData) {
    try {
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser) {
        throw new Error("User with this email already exists");
      }

      const hashedPassword = await this.hashPassword(data.password);

      const user = await prisma.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          role: data.role || UserRole.EMPLOYEE,
        },
        select: {
          id: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          employeeId: true,
          lastLoginAt: true,
        },
      });

      logger.info("User registered successfully", {
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      return { user };
    } catch (error: any) {
      logger.error("Registration failed", {
        email: data.email,
        error: error?.message,
      });
      throw error;
    }
  }

  async login(credentials: LoginCredentials) {
    try {
      const user = await prisma.user.findUnique({
        where: { email: credentials.email },
        include: {
          employee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              employeeId: true,
            },
          },
        },
      });

      if (!user) {
        throw new Error("Invalid email or password");
      }

      if (!user.isActive) {
        throw new Error("Account is deactivated");
      }

      const isPasswordValid = await this.comparePassword(
        credentials.password,
        user.password
      );

      if (!isPasswordValid) {
        throw new Error("Invalid email or password");
      }

      const tokens = this.generateTokens({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      await prisma.refreshToken.create({
        data: {
          token: tokens.refreshToken,
          userId: user.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });

      const { password, ...userWithoutPassword } = user;

      logger.info("User logged in successfully", {
        userId: user.id,
        email: user.email,
      });

      return {
        user: userWithoutPassword,
        tokens,
      };
    } catch (error: any) {
      logger.error("Login failed", {
        email: credentials.email,
        error: error?.message,
      });
      throw error;
    }
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.verifyRefreshToken(refreshToken);

      const storedToken = await prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: { user: true },
      });

      if (!storedToken || storedToken.expiresAt < new Date()) {
        throw new Error("Invalid or expired refresh token");
      }

      if (!storedToken.user.isActive) {
        throw new Error("Account is deactivated");
      }

      const newTokens = this.generateTokens({
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
      });

      logger.info("Token refreshed successfully", {
        userId: payload.userId,
      });

      return { accessToken: newTokens.accessToken };
    } catch (error: any) {
      logger.error("Token refresh failed", { error: error?.message });
      throw error;
    }
  }

  async logout(refreshToken: string): Promise<void> {
    try {
      await prisma.refreshToken.deleteMany({
        where: { token: refreshToken },
      });
      logger.info("User logged out successfully");
    } catch (error: any) {
      logger.error("Logout failed", { error: error?.message });
    }
  }

  async getUserById(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          employeeId: true,
          lastLoginAt: true,
          employee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              employeeId: true,
              department: {
                select: {
                  id: true,
                  name: true,
                },
              },
              position: {
                select: {
                  id: true,
                  title: true,
                },
              },
            },
          },
        },
      });

      return user;
    } catch (error: any) {
      logger.error("Failed to get user by ID", {
        userId,
        error: error?.message,
      });
      throw error;
    }
  }

  async cleanExpiredTokens(): Promise<void> {
    try {
      const result = await prisma.refreshToken.deleteMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
      });

      logger.info("Cleaned expired tokens", { count: result.count });
    } catch (error: any) {
      logger.error("Failed to clean expired tokens", { error: error?.message });
    }
  }
}

export const authService = new AuthService();
