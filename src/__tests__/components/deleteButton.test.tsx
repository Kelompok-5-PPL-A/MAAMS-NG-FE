import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import { DeleteButton } from '../../components/deleteButton'

// Mock router
const mockPush = jest.fn()
const mockUsePathname = jest.fn()
const mockReload = jest.fn()
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: mockPush,
    reload: mockReload
  }),
  usePathName: () => ({
    pathname: mockUsePathname
  })
}))

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn()
}
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true
})

beforeEach(() => {
  jest.clearAllMocks()
})

afterEach(() => {
  jest.clearAllMocks()
})

describe('DeleteButton', () => {
  const idQuestion = 'exampleId'
  const pathname = 'example'

  it('should render without errors', () => {
    const { getByTestId } = render(<DeleteButton idQuestion={idQuestion} pathname={pathname} />)
    expect(getByTestId('toggle-open-button')).toBeInTheDocument()
  })

  it('should open and close dropdown menu correctly', () => {
    const { getByTestId, queryByTestId } = render(<DeleteButton idQuestion={idQuestion} pathname={pathname} />)
    const toggleButton = getByTestId('toggle-open-button')
    fireEvent.click(toggleButton)
    expect(getByTestId('delete-button')).toBeInTheDocument()
    fireEvent.mouseDown(document.body)
    expect(queryByTestId('delete-button')).not.toBeInTheDocument()
  })
})
