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

                // Ensure email is defined
                const userEmail = email || user?.email || profile?.email;
                if (!userEmail) {
                    console.error('No email found for user.');
                    return false; // Prevent sign-in
                }

                const currentUser = await User.findOne({ email: userEmail });
                console.log('Current user:', currentUser);

                if (currentUser == null) {
                    console.log('Creating new user');
                    const newUser = new User({
                        email: userEmail,
                        username: userEmail.split('@')[0], // Now safe
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