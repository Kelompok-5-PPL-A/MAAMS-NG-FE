import { renderHook} from '@testing-library/react-hooks';
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
  it('should return loading state initially', () => {
    (useSession as jest.Mock).mockReturnValue({ status: 'loading', data: null });
    const { result } = renderHook(() => useAuth());

    expect(result.current.isLoading).toBe(true);
  });

  it('should authenticate user when token is valid', async () => {
    (useSession as jest.Mock).mockReturnValue({
      status: 'authenticated',
      data: { access_token: 'valid_token', user: { name: 'Test User' } },
    });
    (verifyToken as jest.Mock).mockResolvedValue({});

    const { result, waitForNextUpdate } = renderHook(() => useAuth());
    await waitForNextUpdate();

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.user).toEqual({ name: 'Test User' });
  });

  it('should set authentication to false if token is invalid', async () => {
    (useSession as jest.Mock).mockReturnValue({
      status: 'authenticated',
      data: { access_token: 'invalid_token', user: { name: 'Test User' } },
    });
    (verifyToken as jest.Mock).mockRejectedValue(new Error('Invalid token'));

    const { result, waitForNextUpdate } = renderHook(() => useAuth());
    await waitForNextUpdate();

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it('should set authentication to false if session is null', () => {
    (useSession as jest.Mock).mockReturnValue({ status: 'unauthenticated', data: null });
    const { result } = renderHook(() => useAuth());

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });
});
