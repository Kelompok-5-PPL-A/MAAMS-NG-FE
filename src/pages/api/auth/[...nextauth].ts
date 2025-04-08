import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import NextAuth from "next-auth";
import { googleLogin } from "@/actions/auth";
import axios from "axios";

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "openid email profile",
        },
      },
    }),
  ],

  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, account, user }) {
      if (account?.provider === "google" && account?.id_token) {
        try {
          const response = await googleLogin(account.id_token);
          const { access_token, refresh_token, user, is_new_user } = response.data;
          return {
            ...token,
            accessToken: access_token,
            refreshToken: refresh_token,
            user: {
              uuid: user.uuid,
              email: user.email,
              username: user.username,
              first_name: user.first_name,
              last_name: user.last_name,
              is_active: user.is_active,
              role: user.role,
              npm: user.npm,
              angkatan: user.angkatan,
              is_new_user: is_new_user,
            },
          };
        } catch (error) {
          console.error("Google login failed:", error);
          return {
            ...token,
            error: "GoogleLoginFailed",
          };
        }
      }   
      return token;
    },
    async session({ session, token }) {
      return {
        ...session,
        accessToken: token.accessToken,
        refreshToken: token.refreshToken,
        user: {
          ...token.user!,
        },
        error: token.error,
      };
    },
  },
  session: {
    strategy: "jwt",
  },
});