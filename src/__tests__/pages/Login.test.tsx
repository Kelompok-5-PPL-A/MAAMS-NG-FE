import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import Login from '@/pages/login'
import { useRouter } from 'next/router'
import { SessionProvider } from 'next-auth/react'

// Mock next/router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/login',
    query: {},
    asPath: '/login',
    events: {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
    },
  }),
}))

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: () => ({
    data: null,
    status: 'unauthenticated',
  }),
  SessionProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

describe('Login Page', () => {
  it('renders login page', () => {
    render(
      <SessionProvider session={null}>
        <Login />
      </SessionProvider>
    )
    expect(screen.getByTestId('login-page')).toBeInTheDocument()
    expect(screen.getByTestId('login-title')).toBeInTheDocument()
    expect(screen.getByTestId('google-login-button')).toBeInTheDocument()
    expect(screen.getByTestId('sso-login-button')).toBeInTheDocument()
  })
})
