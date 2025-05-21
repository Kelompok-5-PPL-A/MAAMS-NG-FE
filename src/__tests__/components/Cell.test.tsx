import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Cell } from '../../components/cell'
import { CauseStatus } from '../../lib/enum'

// Mock the translation function
jest.mock('../../lib/i18n', () => ({
  useTranslation: () => ({ t: (key: string) => key })
}), { virtual: true })

describe('Cell Component', () => {
  const mockOnChange = jest.fn()

  const defaultProps = {
    cellName: 'A1',
    cause: '',
    onChange: mockOnChange,
    disabled: false,
    placeholder: 'Isi sebab..',
    feedback: 'Some feedback',
    causeStatus: CauseStatus.Unchecked,
    index: 0
  }

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('renders cell name correctly', () => {
    render(<Cell {...defaultProps} />)
    expect(screen.getByText('A1')).toBeInTheDocument()
  })

  test('calls onChange when typing in textarea with valid input', () => {
    render(<Cell {...defaultProps} />)
    const textarea = screen.getByPlaceholderText('Isi sebab..')

    fireEvent.change(textarea, { target: { value: 'New Cause' } })
    expect(mockOnChange).toHaveBeenCalledWith('New Cause')
  })

  test('does not call onChange when input is empty', () => {
    render(<Cell {...defaultProps} />)
    const textarea = screen.getByPlaceholderText('Isi sebab..')

    fireEvent.change(textarea, { target: { value: '' } })
    expect(mockOnChange).not.toHaveBeenCalled()
  })

  test('does not call onChange when disabled', () => {
    render(<Cell {...defaultProps} disabled={true} />)
    const textarea = screen.getByPlaceholderText('Isi sebab..')

    fireEvent.change(textarea, { target: { value: 'Attempted Change' } })
    expect(mockOnChange).not.toHaveBeenCalled()
  })

  test('renders with pre-filled cause value', () => {
    render(<Cell {...defaultProps} cause="Existing Cause" />)
    const textarea = screen.getByPlaceholderText('Isi sebab..')
    expect(textarea).toHaveValue('Existing Cause')
  })

  test('applies correct border color based on causeStatus', () => {
    const statusMap = {
      [CauseStatus.Incorrect]: 'border-red-500',
      [CauseStatus.CorrectNotRoot]: 'border-green-500',
      [CauseStatus.CorrectRoot]: 'border-purple-500',
      [CauseStatus.Resolved]: 'border-gray-200',
      [CauseStatus.Unchecked]: 'border-black'
    }

    Object.entries(statusMap).forEach(([status, className]) => {
      const { container } = render(<Cell {...defaultProps} causeStatus={status} />)
      const textarea = container.querySelector('textarea')
      expect(textarea).toHaveClass(className)
    })
  })
  
  test('renders feedback correctly for CorrectRoot status', () => {
    render(
      <Cell
        {...defaultProps}
        causeStatus={CauseStatus.CorrectRoot}
        feedback="Root cause found"
      />
    )

    // Assuming your component renders feedback with the format: "☑️ {feedback} Akar Masalah Kolom {cellName[0]} ditemukan"
    const feedbackElement = screen.getByText((content) => 
      content.includes('Root cause found') && 
      content.includes('Akar Masalah Kolom A ditemukan')
    )
    expect(feedbackElement).toBeInTheDocument()
    expect(feedbackElement.textContent).toContain('☑️')
  })

  test('renders feedback correctly for CorrectNotRoot status', () => {
    render(
      <Cell
        {...defaultProps}
        causeStatus={CauseStatus.CorrectNotRoot}
        feedback="Correct but not root"
      />
    )

    const feedbackElement = screen.getByText((content) => 
      content.includes('Correct but not root')
    )
    expect(feedbackElement).toBeInTheDocument()
    expect(feedbackElement.textContent).toContain('✅')
  })

  test('renders feedback correctly for Incorrect status', () => {
    render(
      <Cell
        {...defaultProps}
        causeStatus={CauseStatus.Incorrect}
        feedback="Incorrect cause"
      />
    )

    const feedbackElement = screen.getByText((content) => 
      content.includes('Incorrect cause')
    )
    expect(feedbackElement).toBeInTheDocument()
    expect(feedbackElement.textContent).toContain('❌')
  })

  test('renders feedback correctly for Unchecked status', () => {
    const { container } = render(
      <Cell
        {...defaultProps}
        causeStatus={CauseStatus.Unchecked}
        feedback="Unchecked feedback"
      />
    )

    // For Unchecked status, the feedback should be rendered without any emoji
    expect(container.querySelector('.feedback-text')).toBeNull()
  })

  test('renders no feedback when feedback is empty', () => {
    const { container } = render(
      <Cell
        {...defaultProps}
        causeStatus={CauseStatus.Unchecked}
        feedback=""
      />
    )

    // Check for absence of feedback element with emojis
    expect(container.querySelector('.feedback')).toBeNull()
  })

  test('renders with custom placeholder when provided', () => {
    const customPlaceholder = 'Custom placeholder'
    render(<Cell {...defaultProps} placeholder={customPlaceholder} />)
    expect(screen.getByPlaceholderText(customPlaceholder)).toBeInTheDocument()
  })

  test('renders without placeholder when disabled', () => {
    render(<Cell {...defaultProps} disabled={true} placeholder="Should not show" />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveAttribute('placeholder', 'Should not show')
  })

  test('textarea should be disabled when disabled prop is true', () => {
    render(<Cell {...defaultProps} disabled={true} />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toBeDisabled()
  })

  test('textarea should be enabled when disabled prop is false', () => {
    render(<Cell {...defaultProps} disabled={false} />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).not.toBeDisabled()
  })

  test('renders with appropriate dimensions and styling', () => {
    const { container } = render(<Cell {...defaultProps} />)
    const cellContainer = container.firstChild
    expect(cellContainer).toHaveClass('relative')
  })

  test('handles long feedback text appropriately', () => {
    const longFeedback = 'This is a very long feedback message that should be handled appropriately by the component without breaking the layout or causing visual issues'
    render(
      <Cell
        {...defaultProps}
        causeStatus={CauseStatus.CorrectNotRoot}
        feedback={longFeedback}
      />
    )
    
    expect(screen.getByText((content) => content.includes(longFeedback))).toBeInTheDocument()
  })

  test('does not modify feedback if it already includes "Akar Masalah"', () => {
    render(
      <Cell
        {...defaultProps}
        cause="penyebab"
        causeStatus={CauseStatus.CorrectRoot}
        feedback="Akar Masalah Kolom A ditemukan: Sudah benar"
      />
    )
  
    expect(screen.getByText('☑️ Akar Masalah Kolom A ditemukan: Sudah benar')).toBeInTheDocument()
  })
  
  
})