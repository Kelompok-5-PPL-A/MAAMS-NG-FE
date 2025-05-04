import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { SubmitButton } from '@/components/submitButton'

describe('SubmitButton Component', () => {
  const mockOnClick = jest.fn()
  const defaultProps = {
    onClick: mockOnClick,
    disabled: false,
    label: 'Submit'
  }

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('renders the button with the correct label', () => {
    render(<SubmitButton {...defaultProps} />)
    expect(screen.getByText('Submit')).toBeInTheDocument()
  })

  test('calls onClick when clicked and not disabled', () => {
    render(<SubmitButton {...defaultProps} />)
    const button = screen.getByText('Submit')

    fireEvent.click(button)
    expect(mockOnClick).toHaveBeenCalledTimes(1)
  })

  test('does not call onClick when disabled', () => {
    render(<SubmitButton {...defaultProps} disabled={true} />)
    const button = screen.getByText('Submit')

    fireEvent.click(button)
    expect(mockOnClick).not.toHaveBeenCalled()
  })

  test('applies correct styles when enabled', () => {
    render(<SubmitButton {...defaultProps} />)
    const button = screen.getByText('Submit')

    expect(button).toHaveClass('bg-gradient-to-b from-[#fbc707] to-[#c9a317] cursor-pointer')
  })

  test('applies correct styles when disabled', () => {
    render(<SubmitButton {...defaultProps} disabled={true} />)
    const button = screen.getByText('Submit')

    expect(button).toHaveClass('bg-gradient-to-b from-gray-300 to-gray-400 cursor-not-allowed opacity-50')
  })
})
