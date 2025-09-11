import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { PrismaClient, User, UserRole } from '@prisma/client';
import { 
  UnauthorizedError, 
  NotFoundError, 
  ConflictError, 
  ValidationError,
  createLogger 
} from '@hrm/shared';
import { 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest, 
  ChangePasswordRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest 
} from '../types';

const logger = createLogger('auth-service');
const prisma = new PrismaClient();

export class AuthService {
  private jwtSecret: string;
  private jwtExpiresIn: string;
  private refreshExpiresIn: string;

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET!;
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '15m';
    this.refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
  }

  async login(data: LoginRequest, ipAddress: string, userAgent?: string): Promise<LoginResponse> {
    try {
      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email: data.email.toLowerCase() }
      });

      if (!user) {
        await this.logLoginAttempt(data.email, ipAddress, userAgent, false, 'User not found');
        throw new UnauthorizedError('Invalid email or password');
      }

      // Check if user is active
      if (!user.isActive) {
        await this.logLoginAttempt(user.id, ipAddress, userAgent, false, 'Account inactive');
        throw new UnauthorizedError('Account is inactive');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(data.password, user.password);
      if (!isPasswordValid) {
        await this.logLoginAttempt(user.id, ipAddress, userAgent, false, 'Invalid password');
        throw new UnauthorizedError('Invalid email or password');
      }

      // Generate tokens
      const tokens = await this.generateTokens(user);

      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() }
      });

      // Log successful login
      await this.logLoginAttempt(user.id, ipAddress, userAgent, true);

      logger.info('User logged in successfully', { userId: user.id, email: user.email });

      return {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          employeeId: user.employeeId
        },
        tokens
      };
    } catch (error) {
      logger.error('Login error:', error);
      throw error;
    }
  }

  async register(data: RegisterRequest): Promise<{ user: { id: string; email: string; role: string } }> {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email.toLowerCase() }
      });

      if (existingUser) {
        throw new ConflictError('User with this email already exists');
      }

      // Check if employeeId is already taken
      if (data.employeeId) {
        const existingEmployee = await prisma.user.findUnique({
          where: { employeeId: data.employeeId }
        });

        if (existingEmployee) {
          throw new ConflictError('Employee ID already assigned to another user');
        }
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(data.password, 12);

      // Create user
      const user = await prisma.user.create({
        data: {
          email: data.email.toLowerCase(),
          password: hashedPassword,
          role: (data.role as UserRole) || UserRole.EMPLOYEE,
          employeeId: data.employeeId,
          emailVerificationToken: crypto.randomBytes(32).toString('hex')
        }
      });

      logger.info('User registered successfully', { userId: user.id, email: user.email });

      return {
        user: {
          id: user.id,
          email: user.email,
          role: user.role
        }
      };
    } catch (error) {
      logger.error('Registration error:', error);
      throw error;
    }
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      // Find and validate refresh token
      const tokenRecord = await prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: { user: true }
      });

      if (!tokenRecord || tokenRecord.isRevoked || tokenRecord.expiresAt < new Date()) {
        throw new UnauthorizedError('Invalid or expired refresh token');
      }

      // Check if user is still active
      if (!tokenRecord.user.isActive) {
        throw new UnauthorizedError('Account is inactive');
      }

      // Generate new tokens
      const tokens = await this.generateTokens(tokenRecord.user);

      // Revoke old refresh token
      await prisma.refreshToken.update({
        where: { id: tokenRecord.id },
        data: { isRevoked: true }
      });

      return tokens;
    } catch (error) {
      logger.error('Refresh token error:', error);
      throw error;
    }
  }

  async changePassword(userId: string, data: ChangePasswordRequest): Promise<void> {
    try {
      // Find user
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw new NotFoundError('User not found');
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(data.currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        throw new UnauthorizedError('Current password is incorrect');
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(data.newPassword, 12);

      // Update password and revoke all refresh tokens
      await prisma.$transaction([
        prisma.user.update({
          where: { id: userId },
          data: { password: hashedNewPassword }
        }),
        prisma.refreshToken.updateMany({
          where: { userId },
          data: { isRevoked: true }
        })
      ]);

      logger.info('Password changed successfully', { userId });
    } catch (error) {
      logger.error('Change password error:', error);
      throw error;
    }
  }

  async forgotPassword(data: ForgotPasswordRequest): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { email: data.email.toLowerCase() }
      });

      if (!user) {
        // Don't reveal if email exists or not
        return;
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordResetToken: resetToken,
          passwordResetExpires: resetExpires
        }
      });

      // TODO: Send email with reset token
      logger.info('Password reset token generated', { userId: user.id, email: user.email });
    } catch (error) {
      logger.error('Forgot password error:', error);
      throw error;
    }
  }

  async resetPassword(data: ResetPasswordRequest): Promise<void> {
    try {
      const user = await prisma.user.findFirst({
        where: {
          passwordResetToken: data.token,
          passwordResetExpires: {
            gt: new Date()
          }
        }
      });

      if (!user) {
        throw new UnauthorizedError('Invalid or expired reset token');
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(data.newPassword, 12);

      // Update password and clear reset token, revoke all refresh tokens
      await prisma.$transaction([
        prisma.user.update({
          where: { id: user.id },
          data: {
            password: hashedPassword,
            passwordResetToken: null,
            passwordResetExpires: null
          }
        }),
        prisma.refreshToken.updateMany({
          where: { userId: user.id },
          data: { isRevoked: true }
        })
      ]);

      logger.info('Password reset successfully', { userId: user.id });
    } catch (error) {
      logger.error('Reset password error:', error);
      throw error;
    }
  }

  async logout(refreshToken: string): Promise<void> {
    try {
      await prisma.refreshToken.updateMany({
        where: { token: refreshToken },
        data: { isRevoked: true }
      });
    } catch (error) {
      logger.error('Logout error:', error);
      throw error;
    }
  }

  async validateUser(userId: string): Promise<User | null> {
    try {
      return await prisma.user.findUnique({
        where: { id: userId, isActive: true }
      });
    } catch (error) {
      logger.error('Validate user error:', error);
      return null;
    }
  }

  private async generateTokens(user: User): Promise<{ accessToken: string; refreshToken: string }> {
    // Generate access token
    const accessTokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      employeeId: user.employeeId
    };

    const accessToken = jwt.sign(accessTokenPayload, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn
    });

    // Generate refresh token
    const refreshTokenValue = crypto.randomBytes(32).toString('hex');
    const refreshExpiresAt = new Date();
    refreshExpiresAt.setTime(refreshExpiresAt.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await prisma.refreshToken.create({
      data: {
        token: refreshTokenValue,
        userId: user.id,
        expiresAt: refreshExpiresAt
      }
    });

    return {
      accessToken,
      refreshToken: refreshTokenValue
    };
  }

  private async logLoginAttempt(
    userIdOrEmail: string, 
    ipAddress: string, 
    userAgent?: string, 
    success: boolean = true, 
    failureReason?: string
  ): Promise<void> {
    try {
      let userId = userIdOrEmail;
      
      // If it's an email, find the user ID
      if (userIdOrEmail.includes('@')) {
        const user = await prisma.user.findUnique({
          where: { email: userIdOrEmail }
        });
        if (!user) return;
        userId = user.id;
      }

      await prisma.loginHistory.create({
        data: {
          userId,
          ipAddress,
          userAgent,
          success,
          failureReason
        }
      });
    } catch (error) {
      logger.error('Failed to log login attempt:', error);
    }
  }
}