import React from 'react'
import { render, waitFor, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import RecentAnalysis from '../../components/recentAnalysis'
import axiosInstance from '../../services/axiosInstance'
import toast from 'react-hot-toast'
import { SessionProvider, useSession } from 'next-auth/react'

// Mock modules
jest.mock('../../services/axiosInstance')
jest.mock('react-hot-toast')
jest.mock('next-auth/react', () => ({
  ...jest.requireActual('next-auth/react'),
  useSession: jest.fn(),
}))

const mockedAxios = axiosInstance as jest.Mocked<typeof axiosInstance>
const mockedToast = toast as jest.Mocked<typeof toast>
const mockedUseSession = useSession as jest.Mock

// Helper to render with mocked session
const renderWithSession = (ui: React.ReactElement, sessionData: any = null) => {
  return render(
    <SessionProvider session={sessionData}>
      {ui}
    </SessionProvider>
  )
}

describe('RecentAnalysis component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders correctly with recent analysis data', async () => {
    // Mock session data
    mockedUseSession.mockReturnValue({
      data: {
        accessToken: 'mock-token',
        user: { name: 'Test User' }
      },
      status: 'authenticated'
    })

    // Mock API response
    mockedAxios.get.mockResolvedValue({
      data: {
        id: '123',
        title: 'Test Analysis',
        question: 'Test question content',
        tags: ['tag1', 'tag2'],
        mode: 'pribadi',
        created_at: '2023-01-01T00:00:00Z',
        username: 'testuser'
      }
    })

    renderWithSession(<RecentAnalysis />)

    await waitFor(() => {
      expect(screen.getByText(/analisis terbaru/i)).toBeInTheDocument()
      expect(screen.getByText(/Test Analysis/)).toBeInTheDocument()
    })
  })

  it('shows error toast when API call fails', async () => {
    mockedUseSession.mockReturnValue({
      data: {
        accessToken: 'mock-token'
      },
      status: 'authenticated'
    })

    mockedAxios.get.mockRejectedValue(new Error('API Error'))

    renderWithSession(<RecentAnalysis />)

    await waitFor(() => {
      expect(mockedToast.error).toHaveBeenCalledWith('Gagal mengambil data')
    })
  })

  it('does not render when user is not authenticated', () => {
    mockedUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated'
    })

    renderWithSession(<RecentAnalysis />)

    expect(screen.queryByText(/analisis terbaru/i)).not.toBeInTheDocument()
  })

  it('does not render when there is no recent data', async () => {
    mockedUseSession.mockReturnValue({
      data: {
        accessToken: 'mock-token'
      },
      status: 'authenticated'
    })

    mockedAxios.get.mockResolvedValue({
      data: {
        id: '',
        title: '',
        question: '',
        tags: [],
        mode: '',
        created_at: '',
        username: ''
      }
    })

    renderWithSession(<RecentAnalysis />)

    await waitFor(() => {
      expect(screen.queryByText(/analisis terbaru/i)).not.toBeInTheDocument()
    })
  })
})