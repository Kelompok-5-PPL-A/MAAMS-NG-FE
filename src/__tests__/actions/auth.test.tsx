import axios, { AxiosResponse } from 'axios';
import {
  googleLogin,
  refreshToken,
  verifyToken
} from '@/actions/auth';
import { LoginResponse, TokenResponse } from '@/components/types/auth';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Auth API Service', () => {
  const mockBaseUrl = 'http://localhost:8000';
  process.env.NEXT_PUBLIC_API_BASE_URL = mockBaseUrl;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('googleLogin', () => {
    const mockIdToken = 'google-id-token-123';

    const createSuccessfulMockResponse = (): AxiosResponse<LoginResponse> => ({
      data: {
        access_token: 'access-token-123',
        refresh_token: 'refresh-token-456',
        user: {
          uuid: 'user-uuid-789',
          email: 'test@example.com',
          username: 'testuser',
          first_name: 'Test',
          last_name: 'User',
          is_active: true,
          role: 'mahasiswa',
          npm: '1234567890',
          angkatan: '2020',
          date_joined: '2024-03-25T00:00:00Z',
        },
        is_new_user: false,
        detail: 'Login successful'
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as any
    });

    it('should successfully login with Google ID token', async () => {
      const mockResponse = createSuccessfulMockResponse();
      mockedAxios.post.mockResolvedValue(mockResponse);

      const response = await googleLogin(mockIdToken);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        `${mockBaseUrl}/api/v1/auth/login-google/`,
        { id_token: mockIdToken },
        { headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }}
      );
      expect(response.data).toEqual(mockResponse.data);
    });

    it('should handle 400 Bad Request errors', async () => {
      const errorResponse = {
        response: {
          status: 400,
          data: {
            detail: 'Invalid Google ID token'
          }
        }
      };
      mockedAxios.post.mockRejectedValue(errorResponse);

      await expect(googleLogin(mockIdToken)).rejects.toEqual(errorResponse);
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network Error');
      mockedAxios.post.mockRejectedValue(networkError);

      await expect(googleLogin(mockIdToken)).rejects.toThrow('Network Error');
    });
  });

  describe('refreshToken', () => {
    const mockRefreshToken = 'refresh-token-456';

    const createSuccessfulTokenResponse = (): AxiosResponse<TokenResponse> => ({
      data: {
        access: 'new-access-token-789',
        refresh: 'new-refresh-token-101',
        user: {
          uuid: 'user-uuid-789',
          email: 'test@example.com',
          username: 'testuser',
          first_name: 'Test',
          last_name: 'User',
          is_active: true,
          role: 'mahasiswa',
          npm: '1234567890',
          angkatan: '2020',
          date_joined: '2024-03-25T00:00:00Z',
        },
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as any
    });

    it('should successfully refresh token', async () => {
      const mockResponse = createSuccessfulTokenResponse();
      mockedAxios.post.mockResolvedValue(mockResponse);

      const response = await refreshToken(mockRefreshToken);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        `${mockBaseUrl}/api/v1/auth/token/refresh/`,
        { refresh: mockRefreshToken },
        { headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }}
      );
      expect(response.data).toEqual(mockResponse.data);
    });

    it('should handle refresh token expired error', async () => {
      const errorResponse = {
        response: {
          status: 401,
          data: {
            detail: 'Token is invalid or expired'
          }
        }
      };
      mockedAxios.post.mockRejectedValue(errorResponse);

      await expect(refreshToken(mockRefreshToken)).rejects.toEqual(errorResponse);
    });
  });

  describe('verifyToken', () => {
    const mockToken = 'access-token-123';

    const createSuccessfulVerifyResponse = (): AxiosResponse<{ detail: string }> => ({
      data: {
        detail: 'Token is valid'
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as any
    });

    it('should successfully verify token', async () => {
      const mockResponse = createSuccessfulVerifyResponse();
      mockedAxios.get.mockResolvedValue(mockResponse);

      const response = await verifyToken(mockToken);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${mockBaseUrl}/api/v1/auth/token/verify/`,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${mockToken}`
          }
        }
      );
      expect(response.data).toEqual(mockResponse.data);
    });

    it('should handle token verification failure', async () => {
      const errorResponse = {
        response: {
          status: 401,
          data: {
            detail: 'Token is invalid'
          }
        }
      };
      mockedAxios.get.mockRejectedValue(errorResponse);

      await expect(verifyToken(mockToken)).rejects.toEqual(errorResponse);
    });
  });

  describe('Error Handling', () => {
    it('should handle unexpected error formats', async () => {
      const unexpectedError = {
        message: 'Unexpected error',
        code: 'UNEXPECTED_ERROR'
      };
      mockedAxios.post.mockRejectedValue(unexpectedError);

      await expect(googleLogin('test-token')).rejects.toEqual(unexpectedError);
    });
  });
});