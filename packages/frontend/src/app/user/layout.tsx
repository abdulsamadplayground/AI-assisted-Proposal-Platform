'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useUserAuth } from '@/contexts/UserAuthContext';
import { showToast } from '@/lib/toast';
import { FileText, LayoutDashboard, FileStack, PlusCircle, LogOut } from 'lucide-react';

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, logout } = useUserAuth();

  const isActive = (path: string) => pathname === path;

  const handleLogout = () => {
    showToast.success('Logged out successfully');
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center group">
              <div className="transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
              <span className="ml-2 text-xl font-semibold text-gray-900">
                Proposal Platform
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link
                href="/user/dashboard"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive('/user/dashboard')
                    ? 'bg-blue-600 text-white shadow-lg scale-105'
                    : 'text-gray-700 hover:bg-gray-100 hover:scale-105'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
              <Link
                href="/user/proposals"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive('/user/proposals')
                    ? 'bg-blue-600 text-white shadow-lg scale-105'
                    : 'text-gray-700 hover:bg-gray-100 hover:scale-105'
                }`}
              >
                <FileStack className="w-4 h-4" />
                My Proposals
              </Link>
              <Link
                href="/user/proposals/create"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive('/user/proposals/create')
                    ? 'bg-green-600 text-white shadow-lg scale-105'
                    : 'bg-green-600 text-white hover:bg-green-700 hover:scale-105'
                }`}
              >
                <PlusCircle className="w-4 h-4" />
                Create Proposal
              </Link>
              
              {/* User Menu */}
              <div className="flex items-center space-x-3 pl-4 border-l border-gray-300">
                <div className="text-sm">
                  <div className="font-medium text-gray-900">{user?.name}</div>
                  <div className="text-gray-500 text-xs">{user?.email}</div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all duration-200 hover:scale-105 text-sm font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
