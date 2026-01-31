# Authentication System

## Overview
The AI Proposal Platform includes a role-based authentication system that allows users and admins to log in to their respective portals.

---

## Features

### 1. Login Page (`/login`)
- Professional login form with email and password fields
- Show/hide password toggle
- Loading states during authentication
- Toast notifications for success/error messages
- Demo account buttons for quick testing

### 2. Role-Based Access Control
- **User Role**: Access to user portal (`/user/*`)
- **Admin Role**: Access to admin portal (`/admin/*`)
- Automatic redirection based on role after login

### 3. Protected Routes
- All routes except `/login` require authentication
- Unauthenticated users are redirected to `/login`
- Users cannot access admin routes
- Admins can access both admin and user routes (optional)

### 4. Session Management
- User session stored in localStorage
- Auth token stored for API calls
- Persistent login across page refreshes
- Logout functionality in both portals

---

## Demo Accounts

### Admin Account
- **Email**: `admin@example.com`
- **Password**: `admin123`
- **Access**: Admin portal (`/admin/dashboard`)

### User Account
- **Email**: `user@example.com`
- **Password**: `user123`
- **Access**: User portal (`/user/dashboard`)

---

## Authentication Flow

### Login Process
1. User enters email and password
2. Click "Sign In" or use demo account button
3. System validates credentials
4. On success:
   - User data stored in localStorage
   - Auth token generated and stored
   - Toast notification: "Welcome back, [Name]!"
   - Redirect to appropriate dashboard based on role
5. On failure:
   - Toast notification with error message
   - User remains on login page

### Logout Process
1. User clicks "Logout" button in navigation
2. User data and auth token removed from localStorage
3. Toast notification: "Logged out successfully"
4. Redirect to login page

### Auto-Redirect Logic
- **Root (`/`)**: 
  - Not logged in → `/login`
  - Logged in as admin → `/admin/dashboard`
  - Logged in as user → `/user/dashboard`

- **Login page (`/login`)**:
  - Already logged in → Redirect to appropriate dashboard

- **Protected routes**:
  - Not logged in → `/login`
  - Wrong role → Redirect to appropriate dashboard

---

## Implementation Details

### Files Created

#### 1. `src/lib/auth.ts`
Authentication utility functions:
- `login(email, password)` - Authenticate user
- `logout()` - Clear session
- `getCurrentUser()` - Get current user
- `isAuthenticated()` - Check if logged in
- `isAdmin()` - Check if user is admin
- `isUser()` - Check if user is regular user
- `getAuthToken()` - Get auth token for API calls

#### 2. `src/contexts/AuthContext.tsx`
React context for global auth state:
- Provides auth state to all components
- Handles automatic redirects
- Manages user session
- Exports `useAuth()` hook

#### 3. `src/app/login/page.tsx`
Login page component:
- Email and password inputs
- Show/hide password toggle
- Submit button with loading state
- Demo account buttons
- Toast notifications

### Integration Points

#### User Layout (`src/app/user/layout.tsx`)
- Displays logged-in user's name and email
- Logout button in navigation
- Uses `useAuth()` hook

#### Admin Layout (`src/app/admin/layout.tsx`)
- Displays logged-in admin's name and email
- Logout button in sidebar
- Uses `useAuth()` hook

#### Root Layout (`src/app/layout.tsx`)
- Wraps entire app with `AuthProvider`
- Provides auth context to all pages

#### Root Page (`src/app/page.tsx`)
- Checks authentication status
- Redirects based on login state and role

---

## Usage Examples

### Using Auth in Components

```typescript
'use client';

import { useAuth } from '@/contexts/AuthContext';

export default function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  return (
    <div>
      <p>Welcome, {user?.name}!</p>
      <p>Email: {user?.email}</p>
      <p>Role: {user?.role}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Making Authenticated API Calls

```typescript
import { getAuthToken } from '@/lib/auth';

async function fetchData() {
  const token = getAuthToken();
  
  const response = await fetch('/api/data', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  return response.json();
}
```

### Checking User Role

```typescript
import { isAdmin, isUser } from '@/lib/auth';

function MyComponent() {
  if (isAdmin()) {
    return <AdminView />;
  }
  
  if (isUser()) {
    return <UserView />;
  }
  
  return <LoginPrompt />;
}
```

---

## Security Considerations

### Current Implementation (Development)
- Mock authentication with hardcoded users
- Credentials stored in localStorage (not secure for production)
- No password hashing
- No token expiration
- No refresh tokens

### Production Requirements
⚠️ **This authentication system is for DEVELOPMENT ONLY**

For production, implement:

1. **Backend Authentication API**
   - Secure password hashing (bcrypt)
   - JWT tokens with expiration
   - Refresh token mechanism
   - Rate limiting on login attempts
   - HTTPS only

2. **Secure Token Storage**
   - Use httpOnly cookies instead of localStorage
   - Implement CSRF protection
   - Set secure and sameSite flags

3. **Session Management**
   - Token expiration (e.g., 1 hour)
   - Automatic token refresh
   - Logout on token expiration
   - Remember me functionality

4. **Additional Security**
   - Two-factor authentication (2FA)
   - Password reset flow
   - Email verification
   - Account lockout after failed attempts
   - Audit logging

---

## API Integration (TODO)

Replace mock authentication with real API calls:

```typescript
// src/lib/auth.ts

export async function login(email: string, password: string): Promise<User> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Login failed');
  }
  
  const data = await response.json();
  
  // Store user and token
  localStorage.setItem('auth_user', JSON.stringify(data.user));
  localStorage.setItem('auth_token', data.token);
  
  return data.user;
}
```

---

## Testing

### Manual Testing Steps

1. **Test Login**
   - Go to http://localhost:3000
   - Should redirect to `/login`
   - Enter admin credentials
   - Should redirect to `/admin/dashboard`
   - Verify admin name appears in sidebar

2. **Test Logout**
   - Click "Logout" button
   - Should redirect to `/login`
   - Try accessing `/admin/dashboard` directly
   - Should redirect back to `/login`

3. **Test User Login**
   - Login with user credentials
   - Should redirect to `/user/dashboard`
   - Verify user name appears in navigation
   - Try accessing `/admin/dashboard`
   - Should redirect to `/user/dashboard`

4. **Test Session Persistence**
   - Login as admin
   - Refresh the page
   - Should remain logged in
   - Navigate to different pages
   - Should remain logged in

5. **Test Demo Buttons**
   - Click "Admin Login" button
   - Should auto-fill credentials and login
   - Logout
   - Click "User Login" button
   - Should auto-fill credentials and login

---

## Troubleshooting

### Issue: Infinite redirect loop
**Solution**: Clear localStorage and refresh
```javascript
localStorage.clear();
location.reload();
```

### Issue: User not redirecting after login
**Solution**: Check browser console for errors, verify AuthProvider is wrapping the app

### Issue: Logout not working
**Solution**: Verify logout function is clearing localStorage and calling router.push('/login')

### Issue: Protected routes accessible without login
**Solution**: Ensure AuthProvider is checking authentication in useEffect and redirecting

---

## Future Enhancements

1. **Social Login**: Google, GitHub, Microsoft OAuth
2. **Password Reset**: Email-based password reset flow
3. **Email Verification**: Verify email on registration
4. **Two-Factor Authentication**: SMS or authenticator app
5. **Remember Me**: Persistent login option
6. **Session Timeout**: Auto-logout after inactivity
7. **Multiple Sessions**: Manage active sessions
8. **Role Permissions**: Fine-grained permissions beyond user/admin

---

**Created**: January 31, 2026  
**Status**: Development Only - Not Production Ready  
**Next Steps**: Implement backend authentication API
