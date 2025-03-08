import { render, screen, fireEvent } from '@testing-library/react'
import Button from '@/components/common/Button'
import React from 'react'
import '@testing-library/jest-dom'

describe('Button Component', () => {
  const onClick = jest.fn()
  const buttonText = 'Test Button'

  beforeEach(() => {
    onClick.mockClear()
  })

  test('renders button with correct text', () => {
    render(<Button onClick={onClick}>{buttonText}</Button>)
    expect(screen.getByText(buttonText)).toBeInTheDocument()
  })

  test('calls onClick when clicked', () => {
    render(<Button onClick={onClick}>{buttonText}</Button>)
    fireEvent.click(screen.getByText(buttonText))
    expect(onClick).toHaveBeenCalled()
  })

  test('applies outline variant styles by default', () => {
    render(<Button onClick={onClick}>{buttonText}</Button>)
    const button = screen.getByText(buttonText)
    expect(button).toHaveClass('border-yellow-400')
    expect(button).toHaveClass('text-yellow-400')
  })

  test('applies gradient variant styles when specified', () => {
    render(<Button onClick={onClick} variant="gradient">{buttonText}</Button>)
    const button = screen.getByText(buttonText)
    expect(button).toHaveClass('from-yellow-400')
    expect(button).toHaveClass('to-yellow-600')
  })

  test('applies disabled state correctly', () => {
    render(<Button onClick={onClick} disabled>{buttonText}</Button>)
    const button = screen.getByText(buttonText)
    expect(button).toBeDisabled()
  })

  test('applies custom className when provided', () => {
    const customClass = 'custom-test-class'
    render(<Button onClick={onClick} className={customClass}>{buttonText}</Button>)
    const button = screen.getByText(buttonText)
    expect(button).toHaveClass(customClass)
  })

  test('renders with correct button type when specified', () => {
    render(<Button onClick={onClick} type="submit">{buttonText}</Button>)
    const button = screen.getByText(buttonText)
    expect(button).toHaveAttribute('type', 'submit')
  })
}) 