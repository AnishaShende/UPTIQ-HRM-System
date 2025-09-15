import { Request, Response, NextFunction } from 'express';
import { JWTPayload, UserRole } from '../types';
declare global {
    namespace Express {
        interface Request {
            user?: JWTPayload;
            requestId?: string;
        }
    }
}
export declare const authenticateToken: (req: Request, res: Response, next: NextFunction) => void;
export declare const authMiddleware: (req: Request, res: Response, next: NextFunction) => void;
export declare const authorizeRoles: (...roles: UserRole[]) => (req: Request, res: Response, next: NextFunction) => void;
export declare const optionalAuth: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.d.ts.map