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

const AdminAuthContext = createContext<AuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const refreshUser = () => {
    const currentUser = getCurrentUser('admin');
    setUser(currentUser);
  };

  useEffect(() => {
    // Check authentication on mount
    const currentUser = getCurrentUser('admin');
    setUser(currentUser);
    setIsLoading(false);

    // Redirect logic for admin portal
    if (!currentUser && pathname !== '/admin/login') {
      router.push('/admin/login');
    } else if (currentUser && pathname === '/admin/login') {
      router.push('/admin/dashboard');
    }
  }, [pathname, router]);

  const logout = () => {
    authLogout('admin');
    setUser(null);
    router.push('/admin/login');
  };

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}
