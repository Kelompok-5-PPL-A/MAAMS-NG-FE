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

    CredentialsProvider({
      name: "SSO",
      credentials: {
        ticket: { label: "CAS Ticket", type: "text" },
      },
      async authorize(credentials) {
        const ticket = credentials?.ticket;
        try {
          const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}api/v1/auth/login-sso/`, {
            params: { ticket },
          });

          const { user, access_token, refresh_token, is_new_user } = res.data;

          return {
            ...user,
            access_token,
            refresh_token,
            is_new_user,
          };
        } catch (err) {
          console.error("SSO login failed:", err);
          return null;
        }
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

      // SSO login
      if (user?.provider === "sso") {
        return {
          ...token,
          accessToken: user.access_token,
          refreshToken: user.refresh_token,
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
            is_new_user: user.is_new_user,
          },
          provider: "sso",
        };
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