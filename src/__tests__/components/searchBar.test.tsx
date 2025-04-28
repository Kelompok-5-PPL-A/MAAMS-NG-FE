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

  const keyword = ''

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders and triggers onChange and onSubmit', async () => {
    const { getByPlaceholderText } = render(
      <SearchBar
        suggestions={mockSuggestions}
        keyword={keyword}
        onSelect={mockOnSelect}
        onChange={mockOnChange}
        onSubmit={mockOnSubmit}
      />
    )

    expect(getByPlaceholderText('Cari analisis..')).toBeInTheDocument()
  })

  test('handles input change and suggestion filtering', async () => {
    const suggestions = ['apple', 'BAnana', 'orAnge', 'storeApp']

    render(
      <SearchBar
        suggestions={suggestions}
        keyword={keyword}
        onSelect={mockOnSelect}
        onChange={mockOnChange}
        onSubmit={mockOnSubmit}
      />
    )

    const inputElement = screen.getByPlaceholderText('Cari analisis..')

    fireEvent.change(inputElement, { target: { value: 'app' } })

    expect(mockOnChange).toHaveBeenCalledWith('app')

    await waitFor(() => {
      expect(screen.getByText('apple')).toBeInTheDocument()
      expect(screen.getByText('storeApp')).toBeInTheDocument()
      expect(screen.queryByText('BAnana')).not.toBeInTheDocument()
      expect(screen.queryByText('orAnge')).not.toBeInTheDocument()
    })
  })
  

  test('handles submit action', () => {
    render(
      <SearchBar
        suggestions={mockSuggestions}
        keyword={keyword}
        onSelect={mockOnSelect}
        onChange={mockOnChange}
        onSubmit={mockOnSubmit}
      />
    )

    fireEvent.click(screen.getByTestId('search-button'))
    expect(mockOnSubmit).toHaveBeenCalledTimes(1)
  })

  test('triggers onSubmit on enter keypress after input change', async () => {
    render(
      <SearchBar
        suggestions={mockSuggestions}
        keyword={keyword}
        onSelect={mockOnSelect}
        onChange={mockOnChange}
        onSubmit={mockOnSubmit}
      />
    )

    const inputElement = await waitFor(() => screen.getByPlaceholderText('Cari analisis..'))
    fireEvent.change(inputElement, { target: { value: 'keyword' } })
    fireEvent.keyPress(inputElement, { key: 'Enter', charCode: 13 })
    expect(mockOnSubmit).toHaveBeenCalled()
  })

  test('does not submit when non-Enter key is pressed', () => {
    render(
      <SearchBar
        suggestions={mockSuggestions}
        keyword={keyword}
        onSelect={mockOnSelect}
        onChange={mockOnChange}
        onSubmit={mockOnSubmit}
      />
    )
  
    const input = screen.getByRole('combobox')
  
    fireEvent.keyDown(input, { key: 'a', code: 'KeyA' })
  
    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  test('handles input change with no matching suggestions', () => {
    render(
      <SearchBar
        suggestions={['analisis', 'judul', 'kategori']}
        keyword=""
        onSelect={mockOnSelect}
        onChange={mockOnChange}
        onSubmit={mockOnSubmit}
      />
    )
  
    const input = screen.getByRole('combobox')
    fireEvent.change(input, { target: { value: 'xyz' } })
  
    expect(mockOnChange).toHaveBeenCalledWith('xyz')
  })

  test('passes isAdmin=true and publicAnalyses=true to SearchFilter', () => {
    const { rerender } = render(
      <SearchBar
        suggestions={mockSuggestions}
        keyword={keyword}
        onSelect={mockOnSelect}
        onChange={mockOnChange}
        onSubmit={mockOnSubmit}
        isAdmin={true}
        publicAnalyses={true}
      />
    )
  
    const mockedFilter = require('../../components/searchFilter')
    expect(mockedFilter).toHaveBeenCalledWith(
      expect.objectContaining({
        updateFilter: mockOnSelect,
        isAdmin: true,
        publicAnalyses: true
      }),
      {}
    )
  })
  
  test('passes isAdmin=false and publicAnalyses=false to SearchFilter', () => {
    render(
      <SearchBar
        suggestions={mockSuggestions}
        keyword={keyword}
        onSelect={mockOnSelect}
        onChange={mockOnChange}
        onSubmit={mockOnSubmit}
        isAdmin={false}
        publicAnalyses={false}
      />
    )
  
    const mockedFilter = require('../../components/searchFilter')
    expect(mockedFilter).toHaveBeenCalledWith(
      expect.objectContaining({
        updateFilter: mockOnSelect,
        isAdmin: false,
        publicAnalyses: false
      }),
      {}
    )
  })
  
  
})


  
