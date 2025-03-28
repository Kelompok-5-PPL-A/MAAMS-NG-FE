import React from 'react'
import { render, fireEvent, waitFor, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { useRouter } from 'next/router'
import Login from '@/pages/login'
import { SessionProvider, signIn } from 'next-auth/react'
import toast from 'react-hot-toast'

// Mock global.fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  })
) as jest.Mock

// Mock dependencies
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}))

jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    error: jest.fn(),
    success: jest.fn(),
  },
  error: jest.fn(),
  success: jest.fn(),
}))

// Mock next-auth client-side operations
jest.mock('next-auth/react', () => {
  const originalModule = jest.requireActual('next-auth/react')
  return {
    ...originalModule,
    signIn: jest.fn(() => Promise.resolve({ ok: true })),
    getSession: jest.fn(() => Promise.resolve(null)),
    SessionProvider: originalModule.SessionProvider,
  }
})

// Mock the hooks and dependencies
jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: {
      name: 'Test User',
      access_token: 'test-token',
      refresh_token: 'refresh-token',
    },
    session: {
      user: { name: 'Test User' },
    },
    isAuthenticated: true,
    isLoading: false,
  }),
}))

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
  removeItem: jest.fn(),
  length: 0,
  key: jest.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
})

describe('Login Page', () => {
  const mockPush = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockLocalStorage.getItem.mockReturnValue('true') // Mock logged in state
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    })
    ;(signIn as jest.Mock).mockImplementation(() => Promise.resolve({ ok: true }))
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  const renderLoginPage = () => {
    return render(
      <SessionProvider session={null}>
        <Login />
      </SessionProvider>
    )
  }

  describe('Render Login Page', () => {
    it('renders the main heading and input field', () => {
      renderLoginPage()
      expect(screen.getByText('Masuk ke Akun')).toBeInTheDocument()
    })

    it('renders the Google login button', () => {
      renderLoginPage()
      expect(screen.getByText('Masuk dengan Google')).toBeInTheDocument()
    })

    it('renders the Google logo image inside the button', () => {
      renderLoginPage()

      const googleLogo = screen.getByAltText('Google Logo')
      const loginButton = screen.getByText('Masuk dengan Google').closest('button')

      expect(googleLogo).toBeInTheDocument()
      expect(loginButton).toContainElement(googleLogo)
    })

    it('renders the SSO login button', () => {
      renderLoginPage()
      expect(screen.getByText('Masuk dengan SSO UI')).toBeInTheDocument()
    })

    it('renders the UI logo image inside the button', () => {
      renderLoginPage()
      const uiLogo = screen.getByAltText('UI Logo')
      const loginButton = screen.getByText('Masuk dengan SSO UI').closest('button')

      expect(uiLogo).toBeInTheDocument()
      expect(loginButton).toContainElement(uiLogo)
    })

    it('handles Google login click', async () => {
      renderLoginPage()
      fireEvent.click(screen.getByText('Masuk dengan Google'))
      
      await waitFor(() => {
        expect(signIn).toHaveBeenCalledWith('google')
      })
    })

    it('handles Google login error', async () => {
      ;(signIn as jest.Mock).mockRejectedValue(new Error('Login failed'))

      renderLoginPage()
      fireEvent.click(screen.getByText('Masuk dengan Google'))

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to login with Google')
        expect(console.error).toHaveBeenCalled()
      })
    })

    it('handles local storage error when saving user data', async () => {
      const originalSetItem = window.localStorage.setItem;
      window.localStorage.setItem = jest.fn(() => {
        throw new Error('Local storage error');
      });
    
      (signIn as jest.Mock).mockResolvedValueOnce({
        ok: true,
        user: { name: 'Test User' },
        access_token: 'test-token',
      });
    
      render(
        <SessionProvider session={null}>
          <Login />
        </SessionProvider>
      );
    
      fireEvent.click(screen.getByText('Masuk dengan Google'));
    
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Gagal menyimpan data login');
        expect(console.error).toHaveBeenCalledWith(
          'Local storage error:',
          expect.any(Error)
        );
      });
    
      window.localStorage.setItem = originalSetItem;
    });

    it('redirects to home page when authenticated', async () => {
      renderLoginPage()
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/')
        expect(toast.success).toHaveBeenCalledWith(
          expect.stringContaining('Welcome'),
          expect.any(Object)
        )
      })
    })
  })
})