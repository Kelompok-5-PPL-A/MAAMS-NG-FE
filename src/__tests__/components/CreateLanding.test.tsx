import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import toast from 'react-hot-toast'
import CreateLanding from '../../components/CreateLanding'
import { CustomInput } from '../../components/customInput'
import { useRouter } from 'next/router'

jest.mock('react-hot-toast')

jest.mock('next/router', () => ({
  useRouter: jest.fn()
}))

const mockPush = jest.fn()

;(useRouter as jest.Mock).mockReturnValue({
  push: mockPush
})

beforeEach(() => {
  localStorage.clear()
  jest.clearAllMocks()
})

afterEach(() => {
  localStorage.clear()
  jest.clearAllMocks()
})

class LocalStorageMock {
  store: { [key: string]: any }
  length: number

  constructor() {
    this.store = {}
    this.length = 0
  }

  getItem(key: string) {
    return this.store[key] || null
  }

  setItem(key: string, value: string) {
    this.store[key] = value.toString()
    this.length = Object.keys(this.store).length
  }

  clear() {
    this.store = {}
    this.length = 0
  }

  key(index: number) {
    return Object.keys(this.store)[index] || null
  }

  removeItem(key: string) {
    delete this.store[key]
    this.length = Object.keys(this.store).length
  }
}
global.localStorage = new LocalStorageMock()

describe('CreateLanding', () => {
  it('should render CreateLanding component when logged in', () => {
    localStorage.setItem('isLoggedIn', 'true')
    const { getByText } = render(<CreateLanding />)
    expect(getByText('Apa masalah yang ingin dianalisis hari ini?')).toBeInTheDocument()
  })

  it('updates question correctly when input value is changed', () => {
    localStorage.setItem('isLoggedIn', 'true')
    const { getByPlaceholderText } = render(<CreateLanding />)

    const input = getByPlaceholderText('ingin menganalisis apa hari ini ...')

    fireEvent.change(input, { target: { value: 'Pertanyaan baru' } })

    expect(input.getAttribute('value')).toBe('Pertanyaan baru')
  })

  it('displays error when question is not filled', async () => {
    localStorage.setItem('isLoggedIn', 'true')
    const { getByPlaceholderText, getByTitle } = render(<CreateLanding />)
    const input = getByPlaceholderText('ingin menganalisis apa hari ini ...')
    const button = getByTitle('submit_button')
    fireEvent.change(input, { target: { value: '' } })
    fireEvent.submit(button)

    await waitFor(() => {
      setTimeout(() => {
        expect(toast).toHaveBeenCalledWith('Pertanyaan harus diisi')
      }, 2000)
    })
  })

  it('should push router with question query parameter when question state is present', async () => {
    localStorage.setItem('isLoggedIn', 'true')
    const { getByTitle, getByPlaceholderText } = render(<CreateLanding />)

    const input = getByPlaceholderText('ingin menganalisis apa hari ini ...')

    fireEvent.change(input, { target: { value: 'Pertanyaan baru' } })

    expect(input.getAttribute('value')).toBe('Pertanyaan baru')
    const button = getByTitle('submit_button')

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
    const { getByPlaceholderText } = render(
      <CustomInput
        placeholder="Test Input"
        inputClassName="input-class"
        onChange={() => {}}
        value=""
      />
    )
    expect(getByPlaceholderText('Test Input')).toBeInTheDocument()
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
    const { queryByRole } = render(
      <CustomInput
        placeholder="Test Input"
        inputClassName="input-class"
        error=""
        onChange={() => {}}
        value=""
      />
    )

    const icon = queryByRole('img')
    expect(icon).not.toBeInTheDocument()
  })

  it('should render label when label prop is provided', () => {
    const { getByText } = render(
      <CustomInput
        label="Test Label"
        placeholder="Test Input"
        inputClassName="input-class"
        onChange={() => {}}
        value=""
      />
    )

    expect(getByText('Test Label')).toBeInTheDocument()
  })

  it('should not render label when label prop is not provided', () => {
    const { queryByText } = render(
      <CustomInput
        placeholder="Test Input"
        inputClassName="input-class"
        onChange={() => {}}
        value=""
      />
    )

    const label = queryByText('Test Label')
    expect(label).not.toBeInTheDocument()
  })
})