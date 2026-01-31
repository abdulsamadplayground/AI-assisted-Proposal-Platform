'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User, getCurrentUser, logout as authLogout } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => void;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const refreshUser = () => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
  };

  useEffect(() => {
    // Check authentication on mount
    const currentUser = getCurrentUser();
    setUser(currentUser);
    setIsLoading(false);

    // Redirect logic
    if (!currentUser && pathname !== '/login') {
      router.push('/login');
    } else if (currentUser) {
      // Redirect to appropriate dashboard if on login page
      if (pathname === '/login') {
        if (currentUser.role === 'admin') {
          router.push('/admin/dashboard');
        } else {
          router.push('/user/dashboard');
        }
      }
      // Prevent users from accessing admin routes
      else if (pathname?.startsWith('/admin') && currentUser.role !== 'admin') {
        router.push('/user/dashboard');
      }
      // Prevent admins from accessing user routes (optional)
      // else if (pathname?.startsWith('/user') && currentUser.role === 'admin') {
      //   router.push('/admin/dashboard');
      // }
    }
  }, [pathname, router]);

  const logout = () => {
    authLogout();
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
