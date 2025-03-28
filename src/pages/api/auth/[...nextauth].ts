// pages/api/auth/[...nextauth].ts
import GoogleProvider from "next-auth/providers/google";
import NextAuth from "next-auth";
import { googleLogin } from "@/actions/auth";

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
    async jwt({ token, account }) {
      if (account?.id_token) {
        try {
          const response = await googleLogin(account.id_token);
          const backendData = response.data;
          
          return {
            ...token,
            access_token: backendData.access_token,
            refresh_token: backendData.refresh_token,
            uuid: backendData.data.uuid,
            email: backendData.data.email,
            first_name: backendData.data.first_name,
            last_name: backendData.data.last_name,
            is_active: backendData.data.is_active,
            is_staff: backendData.data.is_staff,
          };

        } catch (error) {
          console.error("Google login failed:", error);
          return token;
        }
      }
      
      return token;
    },
    async session({ session, token }) {
      session.user = {
        ...session.user,
        uuid: token.uuid as string,
        email: token.email as string,
        first_name: token.first_name as string,
        last_name: token.last_name as string,
        is_active: token.is_active as boolean,
        is_staff: token.is_staff as boolean,
      };

      session.access_token = token.access_token as string;
      session.refresh_token = token.refresh_token as string;
      session.error = token.error as string;

      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
});