import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { 
  ResponseHelper, 
  asyncHandler, 
  validateRequest 
} from '@hrm/shared';
import {
  loginSchema,
  registerSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  refreshTokenSchema,
  LoginRequest,
  RegisterRequest,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  RefreshTokenRequest
} from '../types';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  login = asyncHandler(async (req: Request, res: Response) => {
    const data: LoginRequest = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.get('User-Agent');

    const result = await this.authService.login(data, ipAddress, userAgent);
    
    ResponseHelper.success(res, result, 200);
  });

  register = asyncHandler(async (req: Request, res: Response) => {
    const data: RegisterRequest = req.body;
    
    const result = await this.authService.register(data);
    
    ResponseHelper.created(res, result);
  });

  refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const data: RefreshTokenRequest = req.body;
    
    const result = await this.authService.refreshToken(data.refreshToken);
    
    ResponseHelper.success(res, result);
  });

  changePassword = asyncHandler(async (req: Request, res: Response) => {
    const data: ChangePasswordRequest = req.body;
    const userId = req.user!.userId;
    
    await this.authService.changePassword(userId, data);
    
    ResponseHelper.success(res, { message: 'Password changed successfully' });
  });

  forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    const data: ForgotPasswordRequest = req.body;
    
    await this.authService.forgotPassword(data);
    
    ResponseHelper.success(res, { 
      message: 'If the email exists, a password reset link has been sent' 
    });
  });

  resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const data: ResetPasswordRequest = req.body;
    
    await this.authService.resetPassword(data);
    
    ResponseHelper.success(res, { message: 'Password reset successfully' });
  });

  logout = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    
    await this.authService.logout(refreshToken);
    
    ResponseHelper.success(res, { message: 'Logged out successfully' });
  });

  getProfile = asyncHandler(async (req: Request, res: Response) => {
    const user = await this.authService.validateUser(req.user!.userId);
    
    if (!user) {
      return ResponseHelper.notFound(res, 'User not found');
    }

    const profile = {
      id: user.id,
      email: user.email,
      role: user.role,
      employeeId: user.employeeId,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
      emailVerified: user.emailVerified,
      twoFactorEnabled: user.twoFactorEnabled
    };
    
    ResponseHelper.success(res, profile);
  });

  // Health check endpoint
  healthCheck = asyncHandler(async (req: Request, res: Response) => {
    ResponseHelper.success(res, {
      service: 'auth-service',
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  });
}

// Create validation middleware for each endpoint
export const loginValidation = validateRequest({ body: loginSchema });
export const registerValidation = validateRequest({ body: registerSchema });
export const changePasswordValidation = validateRequest({ body: changePasswordSchema });
export const forgotPasswordValidation = validateRequest({ body: forgotPasswordSchema });
export const resetPasswordValidation = validateRequest({ body: resetPasswordSchema });
export const refreshTokenValidation = validateRequest({ body: refreshTokenSchema });