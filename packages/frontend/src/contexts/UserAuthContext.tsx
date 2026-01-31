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

const UserAuthContext = createContext<AuthContextType | undefined>(undefined);

export function UserAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const refreshUser = () => {
    const currentUser = getCurrentUser('user');
    setUser(currentUser);
  };

  useEffect(() => {
    // Check authentication on mount
    const currentUser = getCurrentUser('user');
    setUser(currentUser);
    setIsLoading(false);

    // Redirect logic for user portal
    if (!currentUser && pathname !== '/login') {
      router.push('/login');
    } else if (currentUser && pathname === '/login') {
      router.push('/user/dashboard');
    }
  }, [pathname, router]);

  const logout = () => {
    authLogout('user');
    setUser(null);
    router.push('/login');
  };

  return (
    <UserAuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        logout,
        refreshUser,
      }}
    >
      {children}
    </UserAuthContext.Provider>
  );
}

export function useUserAuth() {
  const context = useContext(UserAuthContext);
  if (context === undefined) {
    throw new Error('useUserAuth must be used within a UserAuthProvider');
  }
  return context;
}
