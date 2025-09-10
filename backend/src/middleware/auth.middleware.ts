import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "@/config/env";
import { logger } from "@/config/logger";
import { AppError } from "@/utils/errors";
import { UserRole } from "@shared/types/auth.types";

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: UserRole;
        employeeId?: string;
      };
    }
  }
}

interface JwtPayload {
  id: string;
  email: string;
  role: UserRole;
  employeeId?: string;
  iat?: number;
  exp?: number;
}

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      throw new AppError("Access token is required", 401);
    }

    const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;

    // Add user info to request object
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      employeeId: decoded.employeeId,
    };

    logger.debug("User authenticated", {
      userId: decoded.id,
      role: decoded.role,
    });
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError("Invalid access token", 401));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new AppError("Access token expired", 401));
    } else {
      next(error);
    }
  }
};

export const authorize = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError("User not authenticated", 401));
      return;
    }

    if (!roles.includes(req.user.role)) {
      logger.warn("Unauthorized access attempt", {
        userId: req.user.id,
        userRole: req.user.role,
        requiredRoles: roles,
        endpoint: req.originalUrl,
      });
      next(new AppError("Insufficient permissions", 403));
      return;
    }

    logger.debug("User authorized", {
      userId: req.user.id,
      role: req.user.role,
      endpoint: req.originalUrl,
    });
    next();
  };
};

export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (token) {
      const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
        employeeId: decoded.employeeId,
      };
    }

    next();
  } catch (error) {
    // For optional auth, we don't throw errors, just continue without user
    logger.debug("Optional auth failed, continuing without user", { error });
    next();
  }
};

export const requireEmployeeAccess = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    next(new AppError("User not authenticated", 401));
    return;
  }

  const targetEmployeeId = req.params.employeeId || req.params.id;
  const isOwnRecord = req.user.employeeId === targetEmployeeId;
  const isHROrAdmin = ["HR_ADMIN", "HR_MANAGER", "SUPER_ADMIN"].includes(
    req.user.role
  );
  const isManager = req.user.role === "MANAGER";

  if (!isOwnRecord && !isHROrAdmin && !isManager) {
    logger.warn("Unauthorized employee record access", {
      userId: req.user.id,
      userRole: req.user.role,
      targetEmployeeId,
      userEmployeeId: req.user.employeeId,
    });
    next(new AppError("Access denied to this employee record", 403));
    return;
  }

  next();
};

export const requireSelfOrHigherRole = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    next(new AppError("User not authenticated", 401));
    return;
  }

  const targetUserId = req.params.userId || req.params.id;
  const isSelf = req.user.id === targetUserId;
  const hasHigherRole = ["HR_ADMIN", "HR_MANAGER", "SUPER_ADMIN"].includes(
    req.user.role
  );

  if (!isSelf && !hasHigherRole) {
    next(new AppError("Access denied", 403));
    return;
  }

  next();
};
