import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import { JWTPayload, UserRole, ServiceResponse } from '../types';
import { UnauthorizedError, ForbiddenError } from '../errors';
import { createLogger } from '../utils/logger';

const logger = createLogger('auth-client');

// Configuration for auth service
interface AuthClientConfig {
  authServiceUrl: string;
  jwtSecret: string;
  enableLocalValidation?: boolean;
  cacheUserInfo?: boolean;
  timeout?: number;
}

export class AuthClient {
  private config: AuthClientConfig;
  private userCache = new Map<string, { user: any; timestamp: number }>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor(config: AuthClientConfig) {
    this.config = {
      enableLocalValidation: true,
      cacheUserInfo: false,
      timeout: 5000,
      ...config
    };
  }

  /**
   * Middleware to authenticate JWT tokens
   * Can validate locally or verify with auth service
   */
  authenticate = () => {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
          return next(new UnauthorizedError('Access token required'));
        }

        let decoded: JWTPayload;

        if (this.config.enableLocalValidation) {
          // Local JWT validation
          try {
            decoded = jwt.verify(token, this.config.jwtSecret) as JWTPayload;
            req.user = decoded;
            return next();
          } catch (jwtError) {
            logger.warn('Local JWT validation failed, attempting remote validation', { error: jwtError });
          }
        }

        // Remote validation with auth service
        const user = await this.validateTokenWithAuthService(token);
        req.user = user;
        next();
      } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
          return next(new UnauthorizedError('Invalid access token'));
        }
        if (error instanceof jwt.TokenExpiredError) {
          return next(new UnauthorizedError('Access token expired'));
        }
        return next(error);
      }
    };
  };

  /**
   * Middleware for role-based authorization
   */
  authorize = (...roles: UserRole[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) {
        return next(new UnauthorizedError('Authentication required'));
      }

      if (!roles.includes(req.user.role)) {
        return next(new ForbiddenError('Insufficient permissions'));
      }

      next();
    };
  };

  /**
   * Optional authentication middleware
   * Adds user info if token is valid, but doesn't fail if invalid
   */
  optionalAuth = () => {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];

        if (token && this.config.enableLocalValidation) {
          try {
            const decoded = jwt.verify(token, this.config.jwtSecret) as JWTPayload;
            req.user = decoded;
          } catch (error) {
            // Silently fail for optional auth
          }
        }

        next();
      } catch (error) {
        // For optional auth, we don't throw errors, just continue without user
        next();
      }
    };
  };

  /**
   * Validate token with auth service
   */
  private async validateTokenWithAuthService(token: string): Promise<JWTPayload> {
    try {
      // Check cache first
      if (this.config.cacheUserInfo) {
        const cached = this.userCache.get(token);
        if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
          return cached.user;
        }
      }

      const response = await axios.get(`${this.config.authServiceUrl}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        timeout: this.config.timeout
      });

      if (response.data.success) {
        const user = response.data.data;
        const jwtPayload: JWTPayload = {
          userId: user.id,
          email: user.email,
          role: user.role,
          employeeId: user.employeeId,
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 15 * 60 // 15 minutes
        };

        // Cache user info
        if (this.config.cacheUserInfo) {
          this.userCache.set(token, { user: jwtPayload, timestamp: Date.now() });
        }

        return jwtPayload;
      } else {
        throw new UnauthorizedError('Token validation failed');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new UnauthorizedError('Invalid or expired token');
        }
        if (error.code === 'ECONNREFUSED') {
          logger.error('Auth service unavailable, falling back to local validation');
          throw new Error('Auth service unavailable');
        }
      }
      throw error;
    }
  }

  /**
   * Clear user cache
   */
  clearCache(): void {
    this.userCache.clear();
  }

  /**
   * Verify user has specific permission
   */
  hasPermission = (permission: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) {
        return next(new UnauthorizedError('Authentication required'));
      }

      // Basic permission checking - can be extended
      const rolePermissions: Record<UserRole, string[]> = {
        [UserRole.SUPER_ADMIN]: ['*'],
        [UserRole.HR_ADMIN]: ['user:read', 'user:write', 'employee:*', 'leave:*', 'payroll:*'],
        [UserRole.HR_MANAGER]: ['user:read', 'employee:read', 'employee:write', 'leave:read', 'leave:write'],
        [UserRole.MANAGER]: ['employee:read', 'leave:read'],
        [UserRole.EMPLOYEE]: ['profile:read', 'profile:write'],
        [UserRole.READONLY]: ['profile:read']
      };

      const userPermissions = rolePermissions[req.user.role] || [];
      
      if (userPermissions.includes('*') || userPermissions.includes(permission)) {
        return next();
      }

      return next(new ForbiddenError(`Missing required permission: ${permission}`));
    };
  };
}

/**
 * Create a configured auth client instance
 */
export function createAuthClient(config: AuthClientConfig): AuthClient {
  return new AuthClient(config);
}

/**
 * Default auth middleware factory for quick setup
 */
export function createAuthMiddleware(authServiceUrl: string, jwtSecret: string) {
  const client = createAuthClient({
    authServiceUrl,
    jwtSecret,
    enableLocalValidation: true,
    cacheUserInfo: true
  });

  return {
    authenticate: client.authenticate(),
    authorize: client.authorize.bind(client),
    optionalAuth: client.optionalAuth(),
    hasPermission: client.hasPermission.bind(client)
  };
}
