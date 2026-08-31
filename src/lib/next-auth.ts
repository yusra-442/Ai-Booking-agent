import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'
import CredentialsProvider from 'next-auth/providers/credentials'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
   email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await db.user.findUnique({
          where: { email: credentials.email },
          include: { business: true },
        })

        if (!user || !user.password) return null

        const isValid = await bcrypt.compare(credentials.password, user.password)
        if (!isValid) return null

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          businessId: user.businessId,
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google' || account?.provider === 'github') {
        const existingUser = await db.user.findUnique({
          where: { email: user.email! },
    })

        if (!existingUser) {
          const business = await db.business.create({
            data: {
              name: user.name || 'My Business',
              slug: user.email!.split('@')[0] + '-' + Date.now().toString(36),
              email: user.email!,
              timezone: 'Asia/Karachi',
            },
          })

          await db.user.create({
            data: {
              email: user.email!,
              name: user.name || 'User',
              password: '',
              businessId: business.id,
            },
          })
        }
  }
      return true
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!
        session.user.businessId = token.businessId as string
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.businessId = user.businessId
      }
      return token
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
}
