import React from 'react'
import { render, fireEvent, waitFor, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import toast from 'react-hot-toast'
import CreateLanding from '../../components/CreateLanding'
import { CustomInput } from '../../components/customInput'
import { useRouter } from 'next/router'

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

  it('should render the login page', () => {
    render(<Login />)
    expect(screen.getByText('Masuk ke Akun')).toBeInTheDocument()
  })
})
