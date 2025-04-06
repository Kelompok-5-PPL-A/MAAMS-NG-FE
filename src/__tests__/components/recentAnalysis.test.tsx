import React from 'react'
import { render, waitFor, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import RecentAnalysis from '../../components/recentAnalysis'
import axiosInstance from '../../services/axiosInstance'
import toast from 'react-hot-toast'
import { SessionProvider } from 'next-auth/react'
import { useAuth } from '@/hooks/useAuth'

// Mock module
jest.mock('../../services/axiosInstance')
jest.mock('react-hot-toast')
jest.mock('@/hooks/useAuth')

const mockedAxios = axiosInstance as jest.Mocked<typeof axiosInstance>
const mockedToast = toast as jest.Mocked<typeof toast>
const mockedUseAuth = useAuth as jest.Mock

// Mock localStorage
class LocalStorageMock {
  store: { [key: string]: string } = {}
  length = 0

  getItem(key: string) {
    return this.store[key] || null
  }

  setItem(key: string, value: string) {
    this.store[key] = value.toString()
    this.length = Object.keys(this.store).length
  }

  removeItem(key: string) {
    delete this.store[key]
    this.length = Object.keys(this.store).length
  }

  clear() {
    this.store = {}
    this.length = 0
  }

  key(index: number) {
    return Object.keys(this.store)[index] || null
  }
}
global.localStorage = new LocalStorageMock()

// Helper to render with mocked session
const mockSession = {
  user: { name: 'Mock User', email: 'mock@example.com' },
  expires: '2099-01-01T00:00:00Z',
}
const renderWithSession = (ui: React.ReactElement, session: any = mockSession) => {
  return render(
    <SessionProvider session={session}>
      {ui}
    </SessionProvider>
  )
}

describe('RecentAnalysis component', () => {
  afterEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  it('renders correctly when user is logged in via Google login', async () => {
    localStorage.setItem('isSSOLoggedIn', 'false')
    mockedUseAuth.mockReturnValue({ isAuthenticated: true, isLoading: false })

    mockedAxios.get.mockResolvedValue({
      data: {
        id: 'mockId',
        title: 'mock',
        mode: 'mock',
        question: 'mock',
        created_at: 'mock',
        username: 'mock'
      }
    })

    renderWithSession(<RecentAnalysis />)

    await waitFor(() => {
      expect(screen.getByText(/analisis terbaru/i)).toBeInTheDocument()
    })
  })

  it('renders correctly when user is logged in via SSO (dummy)', async () => {
    localStorage.setItem('isSSOLoggedIn', 'true')
    mockedUseAuth.mockReturnValue({ isAuthenticated: false, isLoading: false })

    mockedAxios.get.mockResolvedValue({
      data: {
        id: 'mockId',
        title: 'mock',
        mode: 'mock',
        question: 'mock',
        created_at: 'mock',
        username: 'mock'
      }
    })

    renderWithSession(<RecentAnalysis />)

    await waitFor(() => {
      expect(screen.getByText(/analisis terbaru/i)).toBeInTheDocument()
    })
  })

  it('shows toast when failed to get data', async () => {
    localStorage.setItem('isSSOLoggedIn', 'false')
    mockedUseAuth.mockReturnValue({ isAuthenticated: true, isLoading: false })

    mockedAxios.get.mockRejectedValueOnce(new Error('Fetch error'))

    renderWithSession(<RecentAnalysis />)

    await waitFor(() => {
      expect(mockedToast.error).toHaveBeenCalledWith('Gagal mengambil data')
    })
  })

  it('does not render when user is not logged in (normal or SSO)', () => {
    localStorage.setItem('isSSOLoggedIn', 'false')
    mockedUseAuth.mockReturnValue({ isAuthenticated: false, isLoading: false })

    renderWithSession(<RecentAnalysis />)

    const element = screen.queryByText(/analisis terbaru/i)
    expect(element).toBeNull()
  })
})
