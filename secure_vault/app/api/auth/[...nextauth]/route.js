import NextAuth from 'next-auth'
import GithubProvider from "next-auth/providers/github"
import GoogleProvider from "next-auth/providers/google"
import User from '@/models/User';
import mongoose from 'mongoose';
import connectDB from '@/db/connectDb';

export const authOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    })
  ],

  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
        console.log('SignIn callback triggered:', { user, account, profile, email });

        if (account.provider === 'google' || account.provider === 'github') {
            try {
                await connectDB();
                console.log('Database connected');

                const currentUser = await User.findOne({ email: email });
                console.log('Current user:', currentUser);

                if (!currentUser) {
                    console.log('Creating new user');
                    const newUser = new User({
                        email: email,
                        username: email.split('@')[0],
                        provider: account.provider,
                    });
                    await newUser.save();
                    console.log('New user created:', newUser);
                }

                return true; // Allow sign-in
            } catch (error) {
                console.error('Error during sign-in:', error);
                return true; // Prevent sign-in on error
            }
        }

        return true; // Prevent sign-in for other providers
    }
}
};

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }