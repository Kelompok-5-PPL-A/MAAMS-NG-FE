import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import PastWeek from '../../pages/history/pastWeek'
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
jest.mock('../../components/searchBar', () => ({
  SearchBar: () => <div data-testid='search-bar'>Mocked SearchBar</div>,
}))
jest.mock('../../components/sectionHistory', () => ({
  __esModule: true,
  default: ({ title }: any) => <div data-testid='section'>{title}</div>,
}))
jest.mock('../../layout/MainLayout', () => ({ children }: any) => (
  <div>{children}</div>
))

// Router mock
const mockPush = jest.fn()
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: mockPush,
    pathname: '/history/pastweek',
    query: {},
  }),
}))

// Aliases
const mockedAxios = axiosInstance as jest.Mocked<typeof axiosInstance>
const mockedToast = toast as jest.Mocked<typeof toast>
const mockedUseSession = useSession as jest.Mock

// Helper
const renderWithSession = (ui: React.ReactElement, sessionData: any = null) => {
  return render(
    <SessionProvider session={sessionData}>
      {ui}
    </SessionProvider>
  )
}

describe('PastWeek Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('menampilkan pesan login jika belum login', () => {
    mockedUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated'
    })

    renderWithSession(<PastWeek />)

    expect(screen.getByText(/mohon login terlebih dahulu/i)).toBeInTheDocument()
  })

  it('menampilkan loading saat status masih loading', () => {
    mockedUseSession.mockReturnValue({
      data: null,
      status: 'loading'
    })

    renderWithSession(<PastWeek />)

    expect(screen.getByText(/memuat/i)).toBeInTheDocument()
  })

  it('memanggil fetchData dan menampilkan komponen jika login berhasil', async () => {
    mockedUseSession.mockReturnValue({
      data: { user: { is_staff: true } },
      status: 'authenticated'
    })

    mockedAxios.get
      .mockResolvedValueOnce({
        data: {
          count: 4,
          results: [
            {
              id: 1,
              question: 'Apa itu UI?',
              title: 'Apa itu UI?',
              created_at: new Date().toISOString(),
              mode: 'Manual',
              username: 'admin',
              tags: ['UI']
            }
          ]
        }
      }) // past_week/older
      .mockResolvedValueOnce({
        data: { pengguna: [], judul: [], topik: [] }
      }) // filter

    renderWithSession(<PastWeek />)

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledTimes(2)
      expect(screen.getByTestId('search-bar')).toBeInTheDocument()
      expect(screen.getByTestId('section')).toBeInTheDocument()
    })
  })

  it('menampilkan toast dan redirect jika fetch gagal', async () => {
    mockedUseSession.mockReturnValue({
      data: { user: { is_staff: false } },
      status: 'authenticated'
    })

    mockedAxios.get.mockRejectedValue(new Error('fetch error'))

    renderWithSession(<PastWeek />)

    await waitFor(() => {
      expect(mockedToast.error).toHaveBeenCalledWith('fetch error')
      expect(mockPush).toHaveBeenCalledWith('/')
    })
  })
})
