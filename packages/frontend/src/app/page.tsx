'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Check both admin and user storage
    const adminUser = typeof window !== 'undefined' ? localStorage.getItem('admin_auth_user') : null;
    const userUser = typeof window !== 'undefined' ? localStorage.getItem('user_auth_user') : null;
    
    if (adminUser) {
      // Admin is logged in
      router.push('/admin/dashboard');
    } else if (userUser) {
      // User is logged in
      router.push('/user/dashboard');
    } else {
      // Not logged in, redirect to unified login
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
}
