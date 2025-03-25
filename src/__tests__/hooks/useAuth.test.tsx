import { renderHook, waitFor } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import { verifyToken } from '@/actions/auth';
import { useAuth } from '@/hooks/useAuth';

jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

jest.mock('@/actions/auth', () => ({
  verifyToken: jest.fn(),
}));

describe('useAuth hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return loading state initially', () => {
    (useSession as jest.Mock).mockReturnValue({ 
      status: 'loading', 
      data: null 
    });
    
    const { result } = renderHook(() => useAuth());
    expect(result.current.isLoading).toBe(true);
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should authenticate user when token is valid', async () => {
    (useSession as jest.Mock).mockReturnValue({
      status: 'authenticated',
      data: { 
        access_token: 'valid_token', 
        refresh_token: 'refresh_token',
        user: { name: 'Test User' } 
      },
    });
    (verifyToken as jest.Mock).mockResolvedValue({});

    const { result } = renderHook(() => useAuth());
    
    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.user).toEqual({ name: 'Test User' });
      expect(result.current.accessToken).toBe('valid_token');
      expect(result.current.refreshToken).toBe('refresh_token');
    });
  });

  it('should set authentication to false if token is invalid', async () => {
    (useSession as jest.Mock).mockReturnValue({
      status: 'authenticated',
      data: { 
        access_token: 'invalid_token', 
        user: { name: 'Test User' } 
      },
    });
    (verifyToken as jest.Mock).mockRejectedValue(new Error('Invalid token'));

    const { result } = renderHook(() => useAuth());
    
    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isLoading).toBe(false);
      expect(verifyToken).toHaveBeenCalledWith('invalid_token');
    });
  });

  it('should set authentication to false if session is null', () => {
    (useSession as jest.Mock).mockReturnValue({ 
      status: 'unauthenticated', 
      data: null 
    });
    
    const { result } = renderHook(() => useAuth());
    
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.user).toBeUndefined();
  });
});