import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { Cell } from '../../components/cell'
import { CauseStatus } from '../../lib/enum'

describe('Cell Component', () => {
  const mockOnChange = jest.fn()

  const defaultProps = {
    cellName: 'A1',
    cause: '',
    onChange: mockOnChange,
    disabled: false,
    placeholder: 'Enter cause...',
    feedback: 'Some feedback',
  }

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('renders cell name correctly', () => {
    render(<Cell {...defaultProps} causeStatus={CauseStatus.Unchecked} />)
    expect(screen.getByText('A1')).toBeInTheDocument()
  })

  test('calls onChange when typing in textarea', () => {
    render(<Cell {...defaultProps} causeStatus={CauseStatus.Unchecked} />)
    const textarea = screen.getByPlaceholderText('Enter cause...')

    fireEvent.change(textarea, { target: { value: 'New Cause' } })
    expect(mockOnChange).toHaveBeenCalledWith('New Cause')
  })

  test('does not call onChange when disabled', () => {
    render(<Cell {...defaultProps} disabled={true} causeStatus={CauseStatus.Unchecked} />)
    const textarea = screen.getByPlaceholderText('Enter cause...')

    fireEvent.change(textarea, { target: { value: 'Attempted Change' } })
    expect(mockOnChange).not.toHaveBeenCalled()
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
      render(<Cell {...defaultProps} causeStatus={status as CauseStatus} />)
      const textareas = screen.getAllByPlaceholderText('Enter cause...')
      const textarea = textareas[textareas.length - 1] // Get the latest rendered textarea
      expect(textarea).toHaveClass(className)
    })
  })
  
  it('renders correct feedback message', () => {
    render(<Cell {...defaultProps} causeStatus={CauseStatus.CorrectRoot} feedback="Root Cause Found" />);
    expect(screen.getByText('☑️ Root Cause Found Akar Masalah Kolom A ditemukan')).toBeInTheDocument();
  });

  it('renders empty feedback when causeStatus is Unchecked', () => {
    render(<Cell {...defaultProps} causeStatus={CauseStatus.Unchecked} feedback="" />)
    
    // Ensure NO feedback emoji or text is present
    expect(screen.queryByText('☑️ Root Cause Found Akar Masalah Kolom A ditemukan')).toBeNull()
  })

  test('does not call onChange when input is empty', () => {
    render(<Cell {...defaultProps} causeStatus={CauseStatus.Unchecked} />);
    const textarea = screen.getByPlaceholderText('Enter cause...');
  
    fireEvent.change(textarea, { target: { value: '' } });
  
    expect(mockOnChange).not.toHaveBeenCalled();
  });  
})
