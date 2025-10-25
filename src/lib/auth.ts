import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

// Demo users - Replace this with database lookup in production
const DEMO_USERS = [
  {
    id: '1',
    username: 'demo',
    password: 'demo123',
    name: 'Demo User',
    email: 'demo@ewars.gov.bd',
    role: 'viewer'
  },
  {
    id: '2',
    username: 'admin',
    password: 'admin123',
    name: 'Admin User',
    email: 'admin@ewars.gov.bd',
    role: 'admin'
  }
];

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        // TODO: Replace this with database lookup
        // Example: const user = await db.user.findUnique({ where: { username: credentials.username } });
        const user = DEMO_USERS.find(
          (u) => u.username === credentials.username && u.password === credentials.password
        );

        if (!user) {
          return null;
        }

        // Return user object (password excluded)
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};
