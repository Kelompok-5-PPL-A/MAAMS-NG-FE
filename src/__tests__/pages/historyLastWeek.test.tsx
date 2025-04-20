import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import LastWeek from '../../pages/history/lastWeek'
import axiosInstance from '../../services/axiosInstance'
import toast from 'react-hot-toast'
import { SessionProvider } from 'next-auth/react'

// Mocks
jest.mock('../../services/axiosInstance')
jest.mock('react-hot-toast')
jest.mock('next-auth/react', () => {
  const original = jest.requireActual('next-auth/react')
  return {
    ...original,
    useSession: jest.fn(),
  }
})
jest.mock('../../components/searchBar', () => ({
  SearchBar: ({ onSubmit }: any) => (
    <div data-testid='search-bar' onClick={onSubmit}>Mocked SearchBar</div>
  ),
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
    pathname: '/history/lastWeek',
    query: {}, // bisa diubah dinamis pada test
  }),
}))

// Aliases
const mockedAxios = axiosInstance as jest.Mocked<typeof axiosInstance>
const mockedToast = toast as jest.Mocked<typeof toast>
const { useSession } = jest.requireMock('next-auth/react')

// Helper
const renderWithSession = (ui: React.ReactElement, sessionData: any = null) => {
  return render(<SessionProvider session={sessionData}>{ui}</SessionProvider>)
}

// Test suite
describe('LastWeek Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('menampilkan pesan login jika belum login', () => {
    useSession.mockReturnValue({
      data: null,
      status: 'unauthenticated'
    })

    renderWithSession(<LastWeek />)

    expect(screen.getByText(/mohon login terlebih dahulu/i)).toBeInTheDocument()
  })

  it('menampilkan loading saat status masih loading', () => {
    useSession.mockReturnValue({
      data: null,
      status: 'loading'
    })

    renderWithSession(<LastWeek />)

    expect(screen.getByText(/memuat/i)).toBeInTheDocument()
  })

  it('memanggil fetchData dan menampilkan komponen jika login berhasil', async () => {
    useSession.mockReturnValue({
      data: { user: { name: 'Test User' } },
      status: 'authenticated'
    })
  
    mockedAxios.get
      .mockResolvedValueOnce({ data: { processedData: [{ id: 1 }], count: 4 } }) // /last_week/
      .mockResolvedValueOnce({ data: { pengguna: [], judul: [], topik: [] } })   // /filter/
      .mockResolvedValue({}) // fallback jika ada pemanggilan ekstra
  
    renderWithSession(<LastWeek />)
  
    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith(expect.stringContaining('/question/last_week'))
      expect(mockedAxios.get).toHaveBeenCalledWith('/question/filter/')
      expect(screen.getByTestId('search-bar')).toBeInTheDocument()
      expect(screen.getByTestId('section')).toBeInTheDocument()
    })
  })
  

  it('menampilkan toast dan redirect jika fetch gagal', async () => {
    useSession.mockReturnValue({
      data: { user: { name: 'Test User' } },
      status: 'authenticated'
    })

    mockedAxios.get.mockRejectedValueOnce(new Error('fetch error'))

    renderWithSession(<LastWeek />)

    await waitFor(() => {
      expect(mockedToast.error).toHaveBeenCalledWith('Terjadi kesalahan saat mengambil data')
      expect(mockPush).toHaveBeenCalledWith('/')
    })
  })
})
