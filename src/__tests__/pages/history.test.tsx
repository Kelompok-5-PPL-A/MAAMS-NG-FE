import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import History from '@/components/history'
import axiosInstance from '@/services/axiosInstance'
import toast from 'react-hot-toast'
import { SessionProvider, useSession } from 'next-auth/react'

jest.mock('@/services/axiosInstance')
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

describe('History component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const mockSession = {
    data: {
      accessToken: 'mock-token',
      user: { name: 'Test User' }
    },
    status: 'authenticated'
  }

  it('renders with history data and search bar', async () => {
    mockedUseSession.mockReturnValue(mockSession)

    mockedAxios.get.mockResolvedValue({
      data: {
        pribadi: [
          {
            id: '1',
            title: 'History 1',
            displayed_title: 'History 1',
            tags: ['tag1'],
            timestamp: '2023-01-01T00:00:00Z',
            mode: 'pribadi',
            user: 'user1'
          }
        ],
        publik: []
      }
    })

    renderWithSession(<History />)

    await waitFor(() => {
      expect(screen.getByText(/History 1/i)).toBeInTheDocument()
      expect(screen.getByPlaceholderText(/cari analisis/i)).toBeInTheDocument()
    })
  })

  it('can search and show filtered result', async () => {
    mockedUseSession.mockReturnValue(mockSession)

    mockedAxios.get.mockResolvedValueOnce({
      data: {
        pribadi: [
          {
            id: '1',
            title: 'Filtered History',
            displayed_title: 'Filtered History',
            tags: [],
            timestamp: '2023-01-01T00:00:00Z',
            mode: 'pribadi',
            user: 'user1'
          }
        ],
        publik: []
      }
    })

    renderWithSession(<History />)

    const input = screen.getByPlaceholderText(/cari analisis/i)
    fireEvent.change(input, { target: { value: 'filtered' } })

    const searchBtn = screen.getByTestId('search-button')
    fireEvent.click(searchBtn)

    await waitFor(() => {
      expect(screen.getByText(/Filtered History/i)).toBeInTheDocument()
    })
  })

  it('handles API error with toast', async () => {
    mockedUseSession.mockReturnValue(mockSession)

    mockedAxios.get.mockRejectedValue(new Error('API Error'))

    renderWithSession(<History />)

    await waitFor(() => {
      expect(mockedToast.error).toHaveBeenCalledWith('Gagal mengambil data riwayat')
    })
  })

  it('does not render when not authenticated', () => {
    mockedUseSession.mockReturnValue({ data: null, status: 'unauthenticated' })

    renderWithSession(<History />)

    expect(screen.queryByPlaceholderText(/cari analisis/i)).not.toBeInTheDocument()
  })

  it('shows empty state when no history found', async () => {
    mockedUseSession.mockReturnValue(mockSession)

    mockedAxios.get.mockResolvedValue({
      data: {
        pribadi: [],
        publik: []
      }
    })

    renderWithSession(<History />)

    await waitFor(() => {
      expect(screen.queryByRole('pribadi')).not.toBeInTheDocument()
      expect(screen.queryByRole('publik')).not.toBeInTheDocument()
    })
  })
})
