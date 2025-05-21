import React from 'react'
import { render, fireEvent, waitFor, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import NoSSRSearchFilter from '../../components/searchFilter'

describe('User version - Tests for search filter component', () => {
  const mockUpdateFilter = jest.fn()

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('renders correctly with user options only', async () => {
    render(<NoSSRSearchFilter updateFilter={mockUpdateFilter} />)
    const selectElement = await waitFor(() => screen.findByRole('combobox'))
    expect(selectElement).toBeInTheDocument()

    const options = selectElement.querySelectorAll('option')
    expect(options.length).toBe(3)
    expect(screen.queryByText('Pengguna')).toBeNull()
  })

  test('calls updateFilter function on option change', async () => {
    const { getByRole } = render(<NoSSRSearchFilter updateFilter={mockUpdateFilter} />)
    const selectElement = await waitFor(() => getByRole('combobox'))

    fireEvent.change(selectElement, { target: { value: 'Judul' } })

    expect(mockUpdateFilter).toHaveBeenCalledWith('Judul')
  })

  test('renders correctly without Pengguna option when isAdmin is false', async () => {
    const { getByRole, queryByText } = render(
      <NoSSRSearchFilter isAdmin={false} updateFilter={mockUpdateFilter} publicAnalyses={true} />
    )
    const selectElement = await waitFor(() => getByRole('combobox'))
    expect(selectElement).toBeInTheDocument()

    expect(queryByText('Pengguna')).toBeNull()
  })

  test('renders correctly without Pengguna option when publicAnalyses is false', async () => {
    const { getByRole, queryByText } = render(
      <NoSSRSearchFilter isAdmin={true} updateFilter={mockUpdateFilter} publicAnalyses={false} />
    )
    const selectElement = await waitFor(() => getByRole('combobox'))
    expect(selectElement).toBeInTheDocument()

    expect(queryByText('Pengguna')).toBeNull()
  })

  test('renders Pengguna option when isAdmin is true and publicAnalyses is true', async () => {
    const { getByRole, getByText } = render(
      <NoSSRSearchFilter isAdmin={true} updateFilter={mockUpdateFilter} publicAnalyses={true} />
    )
    const selectElement = await waitFor(() => getByRole('combobox'))
    expect(selectElement).toBeInTheDocument()

    expect(getByText('Pengguna')).toBeInTheDocument()

    const options = selectElement.querySelectorAll('option')
    expect(options.length).toBe(4)
  })

  test('selects the first option by default', async () => {
    const { getByRole } = render(<NoSSRSearchFilter updateFilter={mockUpdateFilter} />)
    const selectElement = await waitFor(() => getByRole('combobox'))
    
    const selectedOption = selectElement.value
    const firstOption = selectElement.querySelector('option').value
    
    expect(selectedOption).toBe(firstOption)
  })

  test('resets to default option when admin props change', async () => {
    const { getByRole, rerender } = render(<NoSSRSearchFilter updateFilter={mockUpdateFilter} />)
    const selectElement = await waitFor(() => getByRole('combobox'))
    
    fireEvent.change(selectElement, { target: { value: 'Judul' } })
    
    rerender(<NoSSRSearchFilter updateFilter={mockUpdateFilter} isAdmin={true} publicAnalyses={true} />)
    
    expect(selectElement.value).toBe('Pengguna')
  })

  test('handles undefined props gracefully', async () => {
    const { getByRole } = render(<NoSSRSearchFilter updateFilter={mockUpdateFilter} isAdmin={undefined} publicAnalyses={undefined} />)
    const selectElement = await waitFor(() => getByRole('combobox'))
    
    expect(selectElement).toBeInTheDocument()
    expect(screen.queryByText('Pengguna')).toBeNull()
  })

  test('handles null props gracefully', async () => {
    const { getByRole } = render(<NoSSRSearchFilter updateFilter={mockUpdateFilter} isAdmin={null} publicAnalyses={null} />)
    const selectElement = await waitFor(() => getByRole('combobox'))
    
    expect(selectElement).toBeInTheDocument()
    expect(screen.queryByText('Pengguna')).toBeNull()
  })
  
  test('does not call updateFilter when initializing', async () => {
    render(<NoSSRSearchFilter updateFilter={mockUpdateFilter} />)
    await waitFor(() => screen.findByRole('combobox'))
    
    expect(mockUpdateFilter).not.toHaveBeenCalled()
  })

  test('handles all filter options correctly', async () => {
    const { getByRole } = render(<NoSSRSearchFilter updateFilter={mockUpdateFilter} />)
    const selectElement = await waitFor(() => getByRole('combobox'))
    
    const options = Array.from(selectElement.querySelectorAll('option'))
    
    for (const option of options) {
      fireEvent.change(selectElement, { target: { value: option.value } })
      expect(mockUpdateFilter).toHaveBeenCalledWith(option.value)
      mockUpdateFilter.mockClear()
    }
  })

  test('handles rapid multiple selections', async () => {
    const { getByRole } = render(<NoSSRSearchFilter updateFilter={mockUpdateFilter} />)
    const selectElement = await waitFor(() => getByRole('combobox'))
    
    const options = Array.from(selectElement.querySelectorAll('option'))
    const firstOption = options[0].value
    const secondOption = options[1].value
    const thirdOption = options[2].value
    
    fireEvent.change(selectElement, { target: { value: thirdOption } })
    fireEvent.change(selectElement, { target: { value: secondOption } })
    fireEvent.change(selectElement, { target: { value: thirdOption } })
    
    expect(mockUpdateFilter).toHaveBeenCalledTimes(3)
    expect(mockUpdateFilter).toHaveBeenNthCalledWith(1, thirdOption)
    expect(mockUpdateFilter).toHaveBeenNthCalledWith(2, secondOption)
    expect(mockUpdateFilter).toHaveBeenNthCalledWith(3, thirdOption)
  })

  test('uses "Semua" as default if no initialFilter is provided', async () => {
    const { getByRole } = render(
      <NoSSRSearchFilter updateFilter={mockUpdateFilter} />
    )
    const selectElement = await waitFor(() => getByRole('combobox'))
    
    expect(selectElement.value).toBe('Semua')
  })

  test('renders with the component\'s default classes', async () => {
    const customClass = 'custom-filter-class'
    const { getByRole } = render(
      <NoSSRSearchFilter updateFilter={mockUpdateFilter} className={customClass} />
    )
    const selectElement = await waitFor(() => getByRole('combobox'))
    
    expect(selectElement).toHaveClass('rounded-bl-[10px]')
    expect(selectElement).toHaveClass('rounded-tl-[10px]')
    expect(selectElement).toHaveClass('bg-inherit')
  })

  test('handles value changes even without disabled prop support', async () => {
    const { getByRole } = render(
      <NoSSRSearchFilter updateFilter={mockUpdateFilter} disabled={true} />
    )
    const selectElement = await waitFor(() => getByRole('combobox'))
    
    expect(selectElement).not.toBeDisabled()
    
    fireEvent.change(selectElement, { target: { value: 'Judul' } })
    expect(mockUpdateFilter).toHaveBeenCalledWith('Judul')
  })
})
