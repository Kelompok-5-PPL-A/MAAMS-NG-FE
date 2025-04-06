// types/auth.d.ts
export interface LoginResponse {
    access_token: string;
    refresh_token: string;
    data: {
      uuid: string;
      email: string;
      first_name: string;
      last_name: string;
      date_joined: string;
      is_active: boolean;
      is_staff: boolean;
    };
    detail: string;
  }
  
  export interface TokenResponse {
    access?: string;
    refresh?: string;
    detail?: string;
  }