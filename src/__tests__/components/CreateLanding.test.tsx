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

describe('CreateLanding Component', () => {
  const mockPush = jest.fn()
  
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks()
    mockLocalStorage.getItem.mockReturnValue('true') // Mock logged in state
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders the main heading and input field', () => {
      render(<CreateLanding />)
      
      expect(screen.getByText('Apa masalah yang ingin dianalisis hari ini?')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('ingin menganalisis apa hari ini ...')).toBeInTheDocument()
      expect(screen.getByTitle('submit_button')).toBeInTheDocument()
    })

    it('renders the landing icon', () => {
      render(<CreateLanding />)
      
      const landingIcon = screen.getByAltText('landing')
      expect(landingIcon).toBeInTheDocument()
      expect(landingIcon.getAttribute('src')).toBe('/icons/landing-icon.svg')
    })
  })
  
  describe('Question Form Test', () => {
    it('updates question correctly when input value is changed', () => {
      localStorage.setItem('isLoggedIn', 'true')
      render(<CreateLanding />)

      const input = screen.getByPlaceholderText('ingin menganalisis apa hari ini ...')

      fireEvent.change(input, { target: { value: 'Pertanyaan baru' } })

      expect(input.getAttribute('value')).toBe('Pertanyaan baru')
    })

    it('displays error when question is not filled', async () => {
      localStorage.setItem('isLoggedIn', 'true')
      render(<CreateLanding />)
      const input = screen.getByPlaceholderText('ingin menganalisis apa hari ini ...')
      const button = screen.getByTitle('submit_button')
      fireEvent.change(input, { target: { value: '' } })
      fireEvent.submit(button)

      await waitFor(() => {
        setTimeout(() => {
          expect(toast.error).toHaveBeenCalledWith('Pertanyaan harus diisi')
        }, 2000)
      })
    })

    it('should push router with question query parameter when question state is present', async () => {
      localStorage.setItem('isLoggedIn', 'true')
      render(<CreateLanding />)

      const input = screen.getByPlaceholderText('ingin menganalisis apa hari ini ...')

      fireEvent.change(input, { target: { value: 'Pertanyaan baru' } })

      expect(input.getAttribute('value')).toBe('Pertanyaan baru')
      const button = screen.getByTitle('submit_button')

      fireEvent.submit(button)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith({
          pathname: '/validator',
          query: { question: 'Pertanyaan baru' }
        })
      })
    })
  })

  describe('CustomInput', () => {
    it('should render input component correctly', () => {
      render(
        <CustomInput
          placeholder="Test Input"
          inputClassName="input-class"
          onChange={() => {}}
          value=""
        />
      )
      expect(screen.getByPlaceholderText('Test Input')).toBeInTheDocument()
    })

    it('should display error icon when error is present', () => {
      const { container } = render(
        <CustomInput
          placeholder="Test Input"
          inputClassName="input-class"
          error="This is an error"
          onChange={() => {}}
          value=""
        />
      )

      const icon = container.querySelector('.chakra-icon')
      
      expect(icon).toBeInTheDocument()
      expect(icon).toHaveClass('chakra-icon')
    })  

    it('should not display error icon when no error is present', () => {
      render(
        <CustomInput
          placeholder="Test Input"
          inputClassName="input-class"
          error=""
          onChange={() => {}}
          value=""
        />
      )

      const icon = screen.queryByRole('img')
      expect(icon).not.toBeInTheDocument()
    })

    it('should render label when label prop is provided', () => {
      render(
        <CustomInput
          label="Test Label"
          placeholder="Test Input"
          inputClassName="input-class"
          onChange={() => {}}
          value=""
        />
      )

      expect(screen.getByText('Test Label')).toBeInTheDocument()
    })

    it('should not render label when label prop is not provided', () => {
      render(
        <CustomInput
          placeholder="Test Input"
          inputClassName="input-class"
          onChange={() => {}}
          value=""
        />
      )

      const label = screen.queryByText('Test Label')
      expect(label).not.toBeInTheDocument()
    })
  })
})