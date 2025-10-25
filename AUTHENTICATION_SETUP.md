# Authentication Setup Guide

This document explains the authentication system implementation for the Bangladesh EWARS dashboard.

## Overview

The authentication system uses **NextAuth.js** (Auth.js) with credentials-based login. Currently configured with demo users, but designed to be extended for production use with a database.

## Installation

### Required Dependencies

Install the following npm packages:

```bash
npm install next-auth
```

**Note**: The project already uses Next.js 15, which is compatible with NextAuth.js v5 (beta).

## Architecture

### Components

1. **Login Page** (`/src/app/login/page.tsx`)
   - Minimal, aesthetic design with white background
   - Card-based layout with shadow
   - "Bangladesh EWARS" branding
   - Demo credentials displayed for easy access

2. **Auth Configuration** (`/src/lib/auth.ts`)
   - NextAuth configuration with credentials provider
   - Demo users database
   - JWT session strategy
   - Role-based access control (RBAC) ready

3. **API Routes** (`/src/app/api/auth/[...nextauth]/route.ts`)
   - NextAuth API handler for authentication endpoints

4. **Session Provider** (`/src/components/providers/session-provider.tsx`)
   - Client-side session management wrapper

5. **Middleware** (`/src/middleware.ts`)
   - Route protection
   - Automatic redirect to login for unauthenticated users

## Demo Credentials

### Available Users

| Username | Password  | Role   | Email                |
|----------|-----------|--------|----------------------|
| demo     | demo123   | viewer | demo@ewars.gov.bd    |
| admin    | admin123  | admin  | admin@ewars.gov.bd   |

### User Roles

- **viewer**: Standard dashboard access
- **admin**: Full access (for future admin features)

## Features

### Current Implementation

✅ **Login Page**
- Clean, minimal design
- White background with subtle card shadow
- Responsive layout
- Error handling with user-friendly messages
- Loading states

✅ **Session Management**
- JWT-based sessions
- 30-day session duration
- Automatic session refresh

✅ **Route Protection**
- Main dashboard (`/`) protected
- Automatic redirect to `/login` if unauthenticated
- Preserves intended destination after login

✅ **User Interface**
- User name and email displayed in header dropdown
- Logout functionality with confirmation
- Session persistence across page refreshes

### Security Features

- Passwords not stored in session/token
- JWT signed with secret key
- Session-only cookies
- CSRF protection (built into NextAuth)

## Configuration

### Environment Variables

Add these to your `.env.local` file:

```env
# NextAuth Configuration
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
```

**Important**:
- Change `NEXTAUTH_SECRET` to a random string in production
- Update `NEXTAUTH_URL` to your production domain

### Generate Secure Secret

For production, generate a secure secret:

```bash
openssl rand -base64 32
```

## File Structure

```
src/
├── app/
│   ├── api/
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.ts          # NextAuth API routes
│   ├── login/
│   │   └── page.tsx                  # Login page UI
│   └── layout.tsx                    # Root layout with SessionProvider
├── components/
│   ├── layout/
│   │   └── header.tsx                # Updated with logout
│   └── providers/
│       └── session-provider.tsx      # Session context
├── lib/
│   └── auth.ts                       # NextAuth configuration
└── middleware.ts                     # Route protection
```

## Usage

### Checking Authentication Status

```typescript
import { useSession } from 'next-auth/react';

export default function Component() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (status === 'unauthenticated') {
    return <div>Access Denied</div>;
  }

  return <div>Welcome {session?.user?.name}</div>;
}
```

### Server-Side Authentication

```typescript
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }

  return Response.json({ data: 'Protected data' });
}
```

### Signing Out

```typescript
import { signOut } from 'next-auth/react';

// Sign out and redirect to login
signOut({ callbackUrl: '/login' });
```

## Migration to Production

### Step 1: Database Setup

Replace the demo users array with a database:

```typescript
// src/lib/auth.ts
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async authorize(credentials) {
  const user = await prisma.user.findUnique({
    where: { username: credentials.username }
  });

  if (!user) return null;

  // Use bcrypt for password verification
  const isValid = await bcrypt.compare(
    credentials.password,
    user.password
  );

  if (!isValid) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}
```

### Step 2: Add Password Hashing

Install bcrypt:

```bash
npm install bcrypt
npm install -D @types/bcrypt
```

### Step 3: Add Additional Providers (Optional)

Add OAuth providers like Google, GitHub, etc.:

```typescript
import GoogleProvider from 'next-auth/providers/google';

providers: [
  GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  }),
  // ... existing CredentialsProvider
]
```

### Step 4: Implement Role-Based Access Control

```typescript
// middleware.ts
import { withAuth } from 'next-auth/middleware';

export default withAuth({
  callbacks: {
    authorized({ token, req }) {
      // Admin-only routes
      if (req.nextUrl.pathname.startsWith('/admin')) {
        return token?.role === 'admin';
      }
      return !!token;
    },
  },
});
```

### Step 5: Add User Registration

Create a registration API route:

```typescript
// src/app/api/register/route.ts
import bcrypt from 'bcrypt';

export async function POST(req: Request) {
  const { username, email, password } = await req.json();

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      username,
      email,
      password: hashedPassword,
      role: 'viewer',
    },
  });

  return Response.json({ success: true });
}
```

## Troubleshooting

### Common Issues

**Issue**: "NEXTAUTH_SECRET not set"
- **Solution**: Add `NEXTAUTH_SECRET` to `.env.local`

**Issue**: Infinite redirect loop
- **Solution**: Ensure `/login` page is not protected in `middleware.ts`

**Issue**: Session not persisting
- **Solution**: Check that cookies are enabled and `NEXTAUTH_URL` matches your domain

**Issue**: "Invalid credentials" with correct password
- **Solution**: Check that username/password match exactly (case-sensitive)

## Security Recommendations

### Production Checklist

- [ ] Change `NEXTAUTH_SECRET` to a cryptographically secure random string
- [ ] Use HTTPS in production (update `NEXTAUTH_URL`)
- [ ] Implement password hashing with bcrypt
- [ ] Add rate limiting to prevent brute force attacks
- [ ] Set up database for user management
- [ ] Implement email verification
- [ ] Add password reset functionality
- [ ] Enable two-factor authentication (2FA)
- [ ] Set up audit logging for authentication events
- [ ] Implement account lockout after failed attempts
- [ ] Use environment variables for all sensitive data
- [ ] Enable Content Security Policy (CSP) headers

## API Endpoints

NextAuth automatically creates these endpoints:

- `GET /api/auth/signin` - Sign in page
- `POST /api/auth/signin/:provider` - Sign in with provider
- `GET /api/auth/signout` - Sign out page
- `POST /api/auth/signout` - Sign out
- `GET /api/auth/session` - Get session
- `GET /api/auth/csrf` - Get CSRF token
- `GET /api/auth/providers` - Get configured providers

## Additional Resources

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [NextAuth.js Examples](https://github.com/nextauthjs/next-auth-example)
- [Database Adapters](https://next-auth.js.org/adapters/overview)
- [OAuth Providers](https://next-auth.js.org/providers/)

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review NextAuth.js documentation
3. Check project GitHub issues
4. Contact the development team

---

**Last Updated**: 2024
**Version**: 1.0.0
