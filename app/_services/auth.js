import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { getUserByEmail } from './apiUsers';

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    strategy: 'jwt',
  },
  providers: [
    Credentials({
      credentials: {
        email: {
          type: 'email',
          label: 'Email',
          placeholder: 'johndoe@gmail.com',
        },
        password: {
          type: 'password',
          label: 'Password',
          placeholder: '*****',
        },
      },

      async authorize(credentials) {
        const user = await getUserByEmail(credentials.email);

        if (!user) return null;

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password,
        );

        return isValid ? user : null;
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const data = await getUserByEmail(user.email);

        token.id = data?.id;
        token.role = data?.role ?? 'USER';
      }
      return token;
    },

    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      return session;
    },
  },

  pages: {
    signIn: '/login',
  },
});
