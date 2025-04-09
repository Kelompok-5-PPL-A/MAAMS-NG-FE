import { LoginResponse, TokenResponse } from '@/components/types/auth';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

const customHeaders = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
};

export const googleLogin = async (id_token: string): Promise<AxiosResponse<LoginResponse>> => {
  const config: AxiosRequestConfig = {
    headers: customHeaders,
  };

  return axios.post(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}api/v1/auth/login-google/`,
    { id_token },
    config
  );
};

export const ssoLogin = async (ticket: string): Promise<AxiosResponse<LoginResponse>> => {
  const config: AxiosRequestConfig = {
    headers: customHeaders,
    params: { ticket },
  };

  return axios.get(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}api/v1/auth/login-sso/`,
    config
  );
};

export const refreshToken = async (refresh_token: string): Promise<AxiosResponse<TokenResponse>> => {
  const config: AxiosRequestConfig = {
    headers: customHeaders,
  };

  return axios.post(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}api/v1/auth/token/refresh/`,
    { refresh: refresh_token },
    config
  );
};

export const verifyToken = async (access_token: string): Promise<AxiosResponse<TokenResponse>> => {
  const config: AxiosRequestConfig = {
    headers: {
      ...customHeaders,
      Authorization: `Bearer ${access_token}`,
    },
  };

  return axios.get(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}api/v1/auth/token/verify/`,
    config
  );
};