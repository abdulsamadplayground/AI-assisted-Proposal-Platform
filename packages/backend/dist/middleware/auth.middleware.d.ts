/**
 * Authentication middleware
 * Verifies JWT tokens and attaches user to request
 */
import { Request, Response, NextFunction } from 'express';
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email: string;
                role: 'user' | 'admin';
            };
        }
    }
}
/**
 * Verify JWT token and attach user to request
 */
export declare const authenticate: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Require admin role
 */
export declare const requireAdmin: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Optional authentication (doesn't fail if no token)
 */
export declare const optionalAuth: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=auth.middleware.d.ts.map