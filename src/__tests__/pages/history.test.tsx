import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import History from '../../pages/history'
import axiosInstance from '../../services/axiosInstance'
import toast from 'react-hot-toast'
import { SessionProvider, useSession } from 'next-auth/react'

// Mocks
jest.mock('../../services/axiosInstance')
jest.mock('react-hot-toast')
jest.mock('next-auth/react', () => ({
  ...jest.requireActual('next-auth/react'),
  useSession: jest.fn(),
}))

const mockedAxios = axiosInstance as jest.Mocked<typeof axiosInstance>
const mockedToast = toast as jest.Mocked<typeof toast>
const mockedUseSession = useSession as jest.Mock

const renderWithSession = (ui: React.ReactElement, sessionData: any = null) => {
  return render(
    <SessionProvider session={sessionData}>
      {ui}
    </SessionProvider>
  )
}

describe('History Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders and fetches history data', async () => {
    mockedUseSession.mockReturnValue({
      data: { accessToken: 'mock-token', user: { name: 'Test User' } },
      status: 'authenticated',
    })

    mockedAxios.get.mockResolvedValueOnce({
      data: {
        count: 1,
        processedData: [
          {
            id: '1',
            title: 'Test Question',
            displayed_title: 'Test Question',
            timestamp: '2023-01-01T00:00:00Z',
            mode: 'public',
            user: 'testuser',
            tags: ['tag1'],
          }
        ]
      }
    })

    renderWithSession(<History />)

    await waitFor(() => {
      expect(screen.getByText('Test Question')).toBeInTheDocument()
    })
  })

  it('shows toast error if API fails', async () => {
    mockedUseSession.mockReturnValue({
      data: { accessToken: 'mock-token', user: { name: 'Test User' } },
      status: 'authenticated',
    })

    mockedAxios.get.mockRejectedValueOnce(new Error('API Error'))

    renderWithSession(<History />)

    await waitFor(() => {
      expect(mockedToast.error).toHaveBeenCalled()
    })
  })

  it('does not render when not authenticated', () => {
    mockedUseSession.mockReturnValue({ data: null, status: 'unauthenticated' })

    renderWithSession(<History />)

    expect(screen.queryByText(/history/i)).not.toBeInTheDocument()
  })

  it('handles search with keyword and filter', async () => {
    mockedUseSession.mockReturnValue({
      data: { accessToken: 'mock-token' },
      status: 'authenticated',
    })

    mockedAxios.get.mockResolvedValue({
      data: {
        count: 0,
        processedData: []
      }
    })

    renderWithSession(<History />)

    // Tunggu komponen siap
    await waitFor(() => screen.getByPlaceholderText('Cari analisis..'))

    const input = screen.getByPlaceholderText('Cari analisis..')
    const select = screen.getByRole('combobox')
    const button = screen.getByTestId('search-button')

    fireEvent.change(input, { target: { value: 'Keyword' } })
    fireEvent.change(select, { target: { value: 'Pengguna' } })
    fireEvent.click(button)

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalled()
    })
  })
})
