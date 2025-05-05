import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import NextAuth from "next-auth";
import { googleLogin, ssoLogin } from "@/actions/auth";

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
      id: "sso",
      name: "sso",
      credentials: {
        ticket: { label: "CAS Ticket", type: "text" },
      },
      async authorize(credentials) {
        const ticket = credentials?.ticket;
        if (!ticket) return null;

        return {
          id: "sso-user",
          ticket,
          provider: "sso",
        } as any;
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
              google_id: user.google_id,
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

      if (user?.provider === "sso" && "ticket" in user) {
        const ticket = (user as any).ticket as string;
        try {
          const res = await ssoLogin(ticket);
          const { data } = res;

          return {
            ...token,
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            user: {
              uuid: data.user.uuid,
              email: data.user.email,
              username: data.user.username,
              first_name: data.user.first_name,
              last_name: data.user.last_name,
              is_active: data.user.is_active,
              role: data.user.role,
              npm: data.user.npm,
              angkatan: data.user.angkatan,
              is_new_user: data.is_new_user,
            },
            provider: "sso",
          };
        } catch (error) {
          console.error("SSO login failed:", error);
          return {
            ...token,
            error: "SSOLoginFailed",
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