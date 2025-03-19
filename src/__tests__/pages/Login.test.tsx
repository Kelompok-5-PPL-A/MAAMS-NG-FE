import React from 'react'
import { render, fireEvent, waitFor, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { useRouter } from 'next/router'
import Login from '@/pages/login'
import google from '@/assets/google.png'

// Mock dependencies
jest.mock('react-hot-toast', () => ({
  error: jest.fn()
}))

jest.mock('next/router', () => ({
  useRouter: jest.fn()
}))

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
  removeItem: jest.fn(),
  length: 0,
  key: jest.fn()
}

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true
})

describe('Login Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockLocalStorage.getItem.mockReturnValue('true') // Mock logged in state
    ;(useRouter as jest.Mock).mockReturnValue({
      push: jest.fn()
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Render Login Page', () => {
    it('renders the main heading and input field', () => {
      render(<Login />)
      
      expect(screen.getByText('Masuk ke Akun')).toBeInTheDocument()
    })

    it('renders the Google login button', () => {
      render(<Login />)
      expect(screen.getByText('Masuk dengan Google')).toBeInTheDocument()
    })

    it('renders the Google logo image inside the button', () => {
      render(<Login />)
      
      const googleLogo = screen.getByAltText('Google Logo')
      const loginButton = screen.getByText('Masuk dengan Google').closest('button')
      
      expect(googleLogo).toBeInTheDocument()
      expect(loginButton).toContainElement(googleLogo)
      
      // Check if the logo is positioned before the text
      const buttonContent = loginButton?.innerHTML
      const logoIndex = buttonContent?.indexOf('Google Logo')
      const textIndex = buttonContent?.indexOf('Masuk dengan Google')
      
      expect(logoIndex).toBeLessThan(textIndex!)
    })
  })
})