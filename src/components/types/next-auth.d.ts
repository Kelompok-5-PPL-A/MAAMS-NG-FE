import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface User extends DefaultUser {
    uuid: string;
    first_name: string;
    last_name: string;
    date_joined?: string;  
    is_active: boolean;
    is_staff: boolean;
    access_token?: string;  
    refresh_token?: string; 
  }

  interface Session extends DefaultSession {
    user: {
      uuid: string;
      email: string;
      first_name: string;
      last_name: string;
      name?: string;
      is_active: boolean;
      is_staff: boolean;
      access_token?: string;
      refresh_token?: string;
    } & DefaultSession["user"];

    access_token?: string;
    refresh_token?: string;
    error?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    uuid: string;
    email: string;
    first_name: string;
    last_name: string;
    is_active: boolean;
    is_staff: boolean;
    access_token?: string;
    refresh_token?: string;
  }
}