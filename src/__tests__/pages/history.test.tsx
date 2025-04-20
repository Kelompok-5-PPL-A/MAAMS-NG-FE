import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
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
    pathname: '/history',
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

describe('History Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('menampilkan pesan login jika belum login', () => {
    mockedUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated'
    })

    renderWithSession(<History />)

    expect(screen.getByText(/mohon login terlebih dahulu/i)).toBeInTheDocument()
  })

  it('memanggil fetchData dan menampilkan komponen jika login berhasil', async () => {
    mockedUseSession.mockReturnValue({
      data: { accessToken: 'mock-token' },
      status: 'authenticated'
    })

    mockedAxios.get
      .mockResolvedValueOnce({ data: { processedData: [{ id: 1 }] } }) // lastWeek
      .mockResolvedValueOnce({ data: { processedData: [{ id: 2 }] } }) // older
      .mockResolvedValueOnce({ data: {} }) // filterData

    renderWithSession(<History />)

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledTimes(3)
      expect(screen.getByTestId('search-bar')).toBeInTheDocument()
      expect(screen.getAllByTestId('section')).toHaveLength(2)
    })
  })

  it('menampilkan toast dan redirect jika fetch gagal', async () => {
    mockedUseSession.mockReturnValue({
      data: { accessToken: 'mock-token' },
      status: 'authenticated'
    })

    mockedAxios.get.mockRejectedValue(new Error('fetch error'))

    renderWithSession(<History />)

    await waitFor(() => {
      expect(mockedToast.error).toHaveBeenCalledWith('Terjadi kesalahan saat mengambil data')
      expect(mockPush).toHaveBeenCalledWith('/')
    })
  })
})
