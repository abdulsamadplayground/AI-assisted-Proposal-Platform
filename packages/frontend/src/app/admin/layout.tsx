'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAdminAuth } from '@/contexts/AdminAuthContext'
import { showToast } from '@/lib/toast'
import { LayoutDashboard, FileText, Settings, Users, TrendingUp, Bell, X, Menu, LogOut } from 'lucide-react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { user, logout } = useAdminAuth()

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Proposals', href: '/admin/proposals', icon: FileText },
    { name: 'Schema Management', href: '/admin/schemas', icon: Settings },
    { name: 'User Management', href: '/admin/users', icon: Users },
    { name: 'Analytics', href: '/admin/analytics', icon: TrendingUp },
    { name: 'Toast Demo', href: '/admin/toast-demo', icon: Bell },
  ]

  const handleLogout = () => {
    showToast.success('Logged out successfully')
    logout()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 bg-gray-800">
            <h1 className="text-xl font-bold text-white">Admin Panel</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-white lg:hidden transition-all duration-200 hover:scale-110"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              const IconComponent = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group ${
                    isActive
                      ? 'bg-gray-800 text-white shadow-lg scale-105'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white hover:scale-105'
                  }`}
                >
                  <IconComponent className={`mr-3 w-5 h-5 transition-transform duration-200 ${isActive ? '' : 'group-hover:scale-110'}`} />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* User Info & Logout */}
          <div className="p-4 border-t border-gray-800">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                <span className="text-white font-medium">{user?.name?.charAt(0) || 'A'}</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">{user?.name || 'Admin User'}</p>
                <p className="text-xs text-gray-400">{user?.email || 'admin@example.com'}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 hover:scale-105 text-sm font-medium"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:pl-64' : ''}`}>
        {/* Top Bar */}
        <div className="sticky top-0 z-40 flex items-center h-16 px-4 bg-white border-b border-gray-200 shadow-sm">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-500 hover:text-gray-700 transition-all duration-200 hover:scale-110"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="ml-4 flex-1">
            <h2 className="text-lg font-semibold text-gray-800">
              {navigation.find(item => item.href === pathname)?.name || 'Admin Panel'}
            </h2>
          </div>
        </div>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
