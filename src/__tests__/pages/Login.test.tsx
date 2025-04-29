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

jest.mock('next-auth/react', () => {
  const originalModule = jest.requireActual('next-auth/react')
  return {
    ...originalModule,
    signIn: jest.fn(() => Promise.resolve({ ok: true })),
    getSession: jest.fn(() => Promise.resolve(null)),
    SessionProvider: originalModule.SessionProvider,
  }
})

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
  const originalLocation = window.location

  beforeEach(() => {
    jest.clearAllMocks()

    // Mock router
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    })

    // Default return value
    mockLocalStorage.getItem.mockImplementation((key: string) => {
      if (key === 'loginMethod') return 'google'
      return null
    })

    // Mock window.location
    delete (window as any).location
    window.location = { href: '' } as any

    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterAll(() => {
    window.location = originalLocation as any
  })

  const renderLoginPage = () => {
    return render(
      <SessionProvider session={null}>
        <Login />
      </SessionProvider>
    )
  }

  describe('Render Login Page', () => {
    it('renders the main heading and buttons', () => {
      renderLoginPage()
      expect(screen.getByText('Masuk ke Akun')).toBeInTheDocument()
      expect(screen.getByText('Masuk dengan Google')).toBeInTheDocument()
      expect(screen.getByText('Masuk dengan SSO UI')).toBeInTheDocument()
    })

    it('renders the Google and UI logos inside their buttons', () => {
      renderLoginPage()
      const googleLogo = screen.getByAltText('Google Logo')
      const uiLogo = screen.getByAltText('UI Logo')

      expect(googleLogo).toBeInTheDocument()
      expect(uiLogo).toBeInTheDocument()
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

    it('handles SSO login click and redirects to CAS login', () => {
      renderLoginPage()

      const ssoButton = screen.getByText('Masuk dengan SSO UI')
      fireEvent.click(ssoButton)

      expect(window.location.href).toContain('https://sso.ui.ac.id/cas2/login?service=')
    })

    it('does not redirect if loginMethod is not google', async () => {
      mockLocalStorage.getItem.mockImplementation((key: string) => {
        if (key === 'loginMethod') return 'sso'
        return null
      })

      renderLoginPage()

      await waitFor(() => {
        expect(mockPush).not.toHaveBeenCalled()
      })
    })
  })
})
