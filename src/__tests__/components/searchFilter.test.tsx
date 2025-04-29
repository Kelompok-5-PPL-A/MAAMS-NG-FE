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
})
