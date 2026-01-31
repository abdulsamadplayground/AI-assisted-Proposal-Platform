/**
 * Authentication utility functions
 * Handles login, logout, and user session management
 * Supports separate sessions for admin and user portals
 */

export type UserRole = 'user' | 'admin';
export type PortalType = 'admin' | 'user';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

/**
 * Get storage keys based on portal type
 */
function getStorageKeys(portalType: PortalType) {
  return {
    user: `${portalType}_auth_user`,
    token: `${portalType}_auth_token`,
  };
}

/**
 * Login with email and password for specific portal
 */
export async function login(email: string, password: string, portalType: PortalType = 'user'): Promise<User> {
  const response = await fetch('http://localhost:3001/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Invalid email or password');
  }
  
  const result = await response.json();
  
  const authUser: User = {
    id: result.user.id,
    email: result.user.email,
    name: result.user.name,
    role: result.user.role,
  };
  
  // Validate role matches portal type
  if (portalType === 'admin' && authUser.role !== 'admin') {
    throw new Error('Admin credentials required for admin portal');
  }
  
  if (portalType === 'user' && authUser.role !== 'user') {
    throw new Error('User credentials required for user portal');
  }
  
  // Store in localStorage with portal-specific keys
  if (typeof window !== 'undefined') {
    const keys = getStorageKeys(portalType);
    localStorage.setItem(keys.user, JSON.stringify(authUser));
    localStorage.setItem(keys.token, result.token);
  }
  
  return authUser;
}

/**
 * Logout current user from specific portal
 */
export function logout(portalType: PortalType = 'user'): void {
  if (typeof window !== 'undefined') {
    const keys = getStorageKeys(portalType);
    localStorage.removeItem(keys.user);
    localStorage.removeItem(keys.token);
  }
}

/**
 * Get current authenticated user for specific portal
 */
export function getCurrentUser(portalType: PortalType = 'user'): User | null {
  if (typeof window === 'undefined') {
    return null;
  }
  
  const keys = getStorageKeys(portalType);
  const userStr = localStorage.getItem(keys.user);
  if (!userStr) {
    return null;
  }
  
  try {
    return JSON.parse(userStr) as User;
  } catch {
    return null;
  }
}

/**
 * Check if user is authenticated in specific portal
 */
export function isAuthenticated(portalType: PortalType = 'user'): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  
  const keys = getStorageKeys(portalType);
  const token = localStorage.getItem(keys.token);
  const user = getCurrentUser(portalType);
  
  return !!(token && user);
}

/**
 * Check if current user has admin role (for admin portal)
 */
export function isAdmin(): boolean {
  const user = getCurrentUser('admin');
  return user?.role === 'admin';
}

/**
 * Check if current user has user role (for user portal)
 */
export function isUser(): boolean {
  const user = getCurrentUser('user');
  return user?.role === 'user';
}

/**
 * Get auth token for specific portal
 */
export function getAuthToken(portalType: PortalType = 'user'): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  
  const keys = getStorageKeys(portalType);
  return localStorage.getItem(keys.token);
}
