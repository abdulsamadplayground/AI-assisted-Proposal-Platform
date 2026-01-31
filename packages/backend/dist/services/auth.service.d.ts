/**
 * Authentication Service
 * Handles user authentication and authorization
 */
export interface LoginRequest {
    email: string;
    password: string;
}
export interface RegisterRequest {
    email: string;
    password: string;
    name: string;
    role?: 'user' | 'admin';
}
export declare class AuthService {
    /**
     * Register a new user
     */
    register(data: RegisterRequest): Promise<{
        user: {
            id: any;
            email: any;
            name: any;
            role: any;
        };
        token: string;
    }>;
    /**
     * Login user
     */
    login(data: LoginRequest): Promise<{
        user: {
            id: any;
            email: any;
            name: any;
            role: any;
        };
        token: string;
    }>;
    /**
     * Generate JWT token
     */
    private generateToken;
    /**
     * Verify JWT token
     */
    verifyToken(token: string): any;
    /**
     * Get user by ID
     */
    getUserById(userId: string): Promise<any>;
}
export declare const authService: AuthService;
//# sourceMappingURL=auth.service.d.ts.map