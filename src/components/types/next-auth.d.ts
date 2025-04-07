import NextAuth, { DefaultSession, DefaultUser } from "next-auth"

declare module "next-auth" {
  interface User extends DefaultUser {
    uuid: string
    email: string
    username: string
    first_name: string
    last_name: string
    role: string
    npm: string
    angkatan: string
    date_joined?: string
    is_active: boolean
    is_staff: boolean
    access_token?: string
    refresh_token?: string
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
      role: string
      npm: string
      angkatan: string
      is_active: boolean
      is_staff: boolean
      access_token?: string
      refresh_token?: string
    } & DefaultSession["user"]

    access_token?: string
    refresh_token?: string
    provider?: string // ✅ Tambahkan ini
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
    npm: string
    angkatan: string
    is_active: boolean
    is_staff: boolean
    access_token?: string
    refresh_token?: string
    provider?: string // ✅ Tambahkan ini juga
  }
}
