import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Cell } from '../../components/cell'
import { CauseStatus } from '../../lib/enum'

// Mock the translation function
jest.mock('../../lib/i18n', () => ({
  useTranslation: () => ({ t: (key: string) => key })
}), { virtual: true })

describe('Cell', () => {
  const defaultProps = {
    cellName: 'A1',
    cause: '',
    onChange: jest.fn(),
    causeStatus: CauseStatus.Unchecked,
    disabled: false,
    placeholder: 'Isi sebab..',
    feedback: '',
    index: 0
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders cell name correctly', () => {
    render(<Cell {...defaultProps} />)
    expect(screen.getByText('A1')).toBeInTheDocument()
  })

  it('renders textarea with correct props', () => {
    render(<Cell {...defaultProps} />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toBeInTheDocument()
    expect(textarea).toHaveAttribute('placeholder', 'Isi sebab..')
    expect(textarea).not.toBeDisabled()
  })

  it('renders disabled textarea when disabled prop is true', () => {
    render(<Cell {...defaultProps} disabled={true} />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toBeDisabled()
  })

  it('applies correct border color based on causeStatus', () => {
    const statusMap = {
      [CauseStatus.Incorrect]: 'border-red-500',
      [CauseStatus.CorrectNotRoot]: 'border-green-500',
      [CauseStatus.CorrectRoot]: 'border-purple-500',
      [CauseStatus.Resolved]: 'border-gray-200',
      [CauseStatus.Unchecked]: 'border-black'
    }

    Object.entries(statusMap).forEach(([status, className]) => {
      const { container } = render(<Cell {...defaultProps} causeStatus={status as CauseStatus} />)
      const textarea = container.querySelector('textarea')
      expect(textarea).toHaveClass(className)
    })
  })

  it('handles onChange correctly', () => {
    render(<Cell {...defaultProps} />)
    const textarea = screen.getByRole('textbox')
    
    fireEvent.change(textarea, { target: { value: 'New value' } })
    expect(defaultProps.onChange).toHaveBeenCalledWith('New value')
  })

  it('does not call onChange when disabled', () => {
    render(<Cell {...defaultProps} disabled={true} />)
    const textarea = screen.getByRole('textbox')
    
    fireEvent.change(textarea, { target: { value: 'New value' } })
    expect(defaultProps.onChange).not.toHaveBeenCalled()
  })

  it('renders with correct styling based on status', () => {
    const { rerender } = render(<Cell {...defaultProps} />)
    
    // Test with different statuses
    const statuses = [
      { status: CauseStatus.Incorrect, expectedClass: 'border-red-500' },
      { status: CauseStatus.CorrectNotRoot, expectedClass: 'border-green-500' },
      { status: CauseStatus.CorrectRoot, expectedClass: 'border-purple-500' },
      { status: CauseStatus.Unchecked, expectedClass: 'border-black' }
    ]

    statuses.forEach(({ status, expectedClass }) => {
      rerender(<Cell {...defaultProps} causeStatus={status} />)
      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveClass(expectedClass)
    })
  })
})