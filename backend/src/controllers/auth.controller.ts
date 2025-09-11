import { Request, Response, NextFunction } from "express";
import { logger } from "@/config/logger";
import { authService } from "@/services/auth.service";
import { LoginCredentials, RegisterData } from "@/services/auth.service";

export class AuthController {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const credentials: LoginCredentials = req.body;
      const result = await authService.login(credentials);
      
      logger.info("Login successful", { email: credentials.email });
      
      res.json({
        success: true,
        message: "Login successful",
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const userData: RegisterData = req.body;
      const result = await authService.register(userData);
      
      logger.info("Registration successful", { email: userData.email });
      
      res.status(201).json({
        success: true,
        message: "Registration successful",
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      const result = await authService.refreshToken(refreshToken);
      
      logger.info("Token refresh successful");
      
      res.json({
        success: true,
        message: "Token refreshed successfully",
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      await authService.logout(refreshToken);
      
      logger.info("Logout successful");
      
      res.json({
        success: true,
        message: "Logout successful"
      });
    } catch (error) {
      next(error);
    }
  }

  async getCurrentUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized"
        });
      }

      const user = await authService.getUserById(userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }
      
      logger.info("Get current user successful", { userId });
      
      res.json({
        success: true,
        message: "User retrieved successfully",
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
