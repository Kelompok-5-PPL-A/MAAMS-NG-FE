import NextAuth, { DefaultSession, DefaultUser } from "next-auth"

declare module "next-auth" {
  interface User extends DefaultUser {
    uuid: string
    email: string
    username: string
    first_name: string
    last_name: string
    role: string
    google_id: string
    npm: string
    angkatan: string
    date_joined?: string
    is_active: boolean
    accessToken?: string
    refreshToken?: string
    is_new_user?: boolean;
    provider?: string;
  }

  interface Session extends DefaultSession {
    user: {
      uuid: string
      email: string
      username: string
      first_name: string
      last_name: string
      google_id: string
      role: string
      npm: string
      angkatan: string
      is_active: boolean
      accessToken?: string
      refreshToken?: string
    } & DefaultSession["user"]

    accessToken?: string
    refreshToken?: string
    provider?: string
    error?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    uuid: string
    email: string
    username: string
    first_name: string
    last_name: string
    role: string
    google_id: string
    npm: string
    angkatan: string
    is_active: boolean
    accessToken?: string
    refreshToken?: string
    provider?: string
  }
}
