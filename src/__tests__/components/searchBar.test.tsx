import React from 'react'
import { render, fireEvent, waitFor, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { SearchBar } from '../../components/searchBar'

jest.mock('../../components/searchFilter', () => {
  return jest.fn(() => <div>Mocked SearchFilter</div>)
})

describe('SearchBar component', () => {
  const mockSuggestions = ['apple', 'banana', 'orange']
  const mockOnChange = jest.fn()
  const mockOnSelect = jest.fn()
  const mockOnSubmit = jest.fn()

  const defaultProps = {
    suggestions: mockSuggestions,
    keyword: '',
    onSelect: mockOnSelect,
    onChange: mockOnChange,
    onSubmit: mockOnSubmit,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders basic elements', () => {
    render(<SearchBar {...defaultProps} />)
    expect(screen.getByPlaceholderText('Cari analisis..')).toBeInTheDocument()
    expect(screen.getByTestId('search-button')).toBeInTheDocument()
    expect(screen.getByText('Mocked SearchFilter')).toBeInTheDocument()
  })

  test('shows suggestions when input matches', async () => {
    render(<SearchBar {...defaultProps} />)
    
    const input = screen.getByRole('combobox')
    fireEvent.change(input, { target: { value: 'app' } })
    
    await waitFor(() => {
      expect(screen.getByText('apple')).toBeInTheDocument()
      expect(screen.queryByText('banana')).not.toBeInTheDocument()
    })
  })

  test('calls onChange when input changes', () => {
    render(<SearchBar {...defaultProps} />)
    
    const input = screen.getByRole('combobox')
    fireEvent.change(input, { target: { value: 'test' } })
    
    expect(mockOnChange).toHaveBeenCalledWith('test')
  })

  test('calls onSubmit when search button clicked', () => {
    render(<SearchBar {...defaultProps} />)
    
    fireEvent.click(screen.getByTestId('search-button'))
    expect(mockOnSubmit).toHaveBeenCalledTimes(1)
  })

  test('calls onSubmit when Enter key pressed', () => {
    render(<SearchBar {...defaultProps} />)
    
    const input = screen.getByRole('combobox')
    fireEvent.keyPress(input, { key: 'Enter', charCode: 13 })
    expect(mockOnSubmit).toHaveBeenCalledTimes(1)
  })

  test('does not show suggestions when input is empty', async () => {
    render(<SearchBar {...defaultProps} />)
    
    const input = screen.getByRole('combobox')
    fireEvent.change(input, { target: { value: '' } })
    fireEvent.focus(input)
    
    await waitFor(() => {
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    })
  })

  test('does not call onSubmit for non-Enter keys', () => {
    render(<SearchBar {...defaultProps} />)
    
    const input = screen.getByRole('combobox')
    fireEvent.keyPress(input, { key: 'A', charCode: 65 })
    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  test('handles case insensitive search', async () => {
    render(<SearchBar {...defaultProps} />)
    
    const input = screen.getByRole('combobox')
    fireEvent.change(input, { target: { value: 'BAN' } })
    
    await waitFor(() => {
      expect(screen.getByText('banana')).toBeInTheDocument()
    })
  })

  test('passes correct props to SearchFilter', () => {
    const testProps = {
      ...defaultProps,
      isAdmin: true,
      publicAnalyses: false
    }
    
    render(<SearchBar {...testProps} />)
    
    const mockedFilter = require('../../components/searchFilter')
    expect(mockedFilter).toHaveBeenCalledWith(
      expect.objectContaining({
        isAdmin: true,
        publicAnalyses: false,
        updateFilter: mockOnSelect
      }),
      {}
    )
  })

})