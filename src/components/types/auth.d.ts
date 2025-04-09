export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: {
    uuid: string;
    email: string;
    username: string;
    first_name: string;
    last_name: string;
    date_joined: string;
    is_active: boolean;
    role: string;
    google_id: string
    npm: string;
    angkatan: string;
  };
  is_new_user: boolean;
  detail: string;
}

export interface TokenResponse {
  access: string;
  refresh: string;
  user: {
    uuid: string;
    email: string;
    username: string;
    first_name: string;
    last_name: string;
    date_joined: string;
    is_active: boolean;
    role: string;
    google_id: string
    npm: string;
    angkatan: string;
  };
}