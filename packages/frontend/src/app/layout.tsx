'use client';

import { usePathname } from 'next/navigation';
import { Toaster } from 'react-hot-toast';
import { AdminAuthProvider } from '@/contexts/AdminAuthContext';
import { UserAuthProvider } from '@/contexts/UserAuthContext';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  return (
    <html lang="en">
      <body>
        {isAdminRoute ? (
          <AdminAuthProvider>{children}</AdminAuthProvider>
        ) : (
          <UserAuthProvider>{children}</UserAuthProvider>
        )}
        <Toaster />
      </body>
    </html>
  );
}
