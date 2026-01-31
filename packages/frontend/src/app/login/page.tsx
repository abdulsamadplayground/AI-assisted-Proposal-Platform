'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { showToast } from '@/lib/toast';
import { FileText, Eye, EyeOff, UserCircle, Shield } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      showToast.error('Please enter email and password');
      return;
    }

    setIsLoading(true);
    const loadingToast = showToast.loading('Logging in...');

    try {
      // Call backend login API
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
      
      const user = {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        role: result.user.role,
      };
      
      // Store in localStorage based on role
      if (typeof window !== 'undefined') {
        if (user.role === 'admin') {
          localStorage.setItem('admin_auth_user', JSON.stringify(user));
          localStorage.setItem('admin_auth_token', result.token);
        } else {
          localStorage.setItem('user_auth_user', JSON.stringify(user));
          localStorage.setItem('user_auth_token', result.token);
        }
      }
      
      showToast.dismiss(loadingToast);
      showToast.success(`Welcome back, ${user.name}!`);
      
      // Redirect based on role
      if (user.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/user/dashboard');
      }
    } catch (error) {
      showToast.dismiss(loadingToast);
      showToast.error(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (role: 'user' | 'admin') => {
    if (role === 'admin') {
      setEmail('admin@example.com');
      setPassword('admin123');
    } else {
      setEmail('user@example.com');
      setPassword('user123');
    }
    
    // Auto-submit after setting credentials
    setTimeout(() => {
      const form = document.querySelector('form');
      if (form) {
        form.requestSubmit();
      }
    }, 100);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4">
      <div className="max-w-md w-full">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full mb-4 shadow-lg transform transition-all duration-300 hover:scale-110 hover:rotate-3">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            AI Proposal Platform
          </h1>
          <p className="text-gray-600">
            Sign in to your account
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                disabled={isLoading}
                autoComplete="email"
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12 text-gray-900 bg-white"
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-all duration-200 hover:scale-110"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 rounded-lg font-medium transition-colors ${
                isLoading
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Demo Accounts */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center mb-4">
              Demo Accounts
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleDemoLogin('user')}
                disabled={isLoading}
                className="flex flex-col items-center justify-center gap-2 px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-all duration-200 hover:scale-105 text-sm font-medium disabled:opacity-50"
              >
                <UserCircle className="w-5 h-5" />
                <span>User Portal</span>
              </button>
              <button
                onClick={() => handleDemoLogin('admin')}
                disabled={isLoading}
                className="flex flex-col items-center justify-center gap-2 px-4 py-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-all duration-200 hover:scale-105 text-sm font-medium disabled:opacity-50"
              >
                <Shield className="w-5 h-5" />
                <span>Admin Portal</span>
              </button>
            </div>
            <div className="mt-3 text-xs text-gray-500 text-center space-y-1">
              <div>User: user@example.com / user123</div>
              <div>Admin: admin@example.com / admin123</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>© 2026 AI Proposal Platform. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
