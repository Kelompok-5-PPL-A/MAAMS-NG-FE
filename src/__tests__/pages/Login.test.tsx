import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import Login from '@/pages/login'

describe('Login Page', () => {
  it('renders login page', () => {
    render(<Login />)
    expect(screen.getByTestId('login-page')).toBeInTheDocument()
    expect(screen.getByTestId('login-title')).toBeInTheDocument()
    expect(screen.getByTestId('google-login-button')).toBeInTheDocument()
    expect(screen.getByTestId('sso-login-button')).toBeInTheDocument()
  })
})
