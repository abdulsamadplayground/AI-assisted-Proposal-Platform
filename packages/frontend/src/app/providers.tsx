'use client';

import { usePathname } from 'next/navigation';
import { AdminAuthProvider } from '@/contexts/AdminAuthContext';
import { UserAuthProvider } from '@/contexts/UserAuthContext';

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  return isAdminRoute ? (
    <AdminAuthProvider>{children}</AdminAuthProvider>
  ) : (
    <UserAuthProvider>{children}</UserAuthProvider>
  );
}
