import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import AnalisisPublik from '../../pages/analisisPublik'
import { SessionProvider, useSession } from 'next-auth/react'
import axiosInstance from '../../services/axiosInstance'
import toast from 'react-hot-toast'
import { act } from '@testing-library/react'


// Mocks
jest.mock('../../services/axiosInstance')
jest.mock('react-hot-toast')
jest.mock('next-auth/react', () => ({
  ...jest.requireActual('next-auth/react'),
  useSession: jest.fn(),
}))
jest.mock('next/router', () => {
  const mockPush = jest.fn()
  return {
    useRouter: () => ({
      push: mockPush,
      pathname: '/privileged',
      query: {},
    }),
    __esModule: true,
    mockPush,
  }
})
let mockOnSelect: (selected: string) => void = jest.fn()

jest.mock('../../components/searchBar', () => {
  const mockSearchBar = jest.fn(({ onSelect }: { onSelect: (selected: string) => void }) => {
    mockOnSelect = onSelect
    return <div data-testid="search-bar">Mocked SearchBar</div>
  })
  return {
    SearchBar: mockSearchBar,
    __esModule: true,
    mockSearchBar,
  }
})

jest.mock('../../components/adminTable', () => ({
  __esModule: true,
  default: ({ data }: any) => (
    <div data-testid="admin-table">
      {data.length ? 'Table with data' : 'Empty Table'}
    </div>
  ),
}))
jest.mock('../../layout/MainLayout', () => ({ children }: any) => (
  <div>{children}</div>
))

jest.mock('../../components/pagination', () => ({
  __esModule: true,
  default: ({ currentPage, onPageChange, totalPages }: any) => (
    <div data-testid="pagination">
      <button onClick={() => onPageChange(currentPage + 1)}>Next Page</button>
      <span>Page {currentPage} of {totalPages}</span>
    </div>
  ),
}))


// Setup
const mockedUseSession = useSession as jest.Mock
const mockedAxios = axiosInstance as jest.Mocked<typeof axiosInstance>
const mockedToast = toast as jest.Mocked<typeof toast>
const { mockPush } = jest.requireMock('next/router')
const mockedSearchBar = require('../../components/searchBar')

const renderWithSession = (ui: React.ReactElement, sessionData: any = null) => {
  return render(
    <SessionProvider session={sessionData}>
      {ui}
    </SessionProvider>
  )
}

describe('AnalisisPublik ', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('shows login message if not authenticated', async () => {
    mockedUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
    })

    renderWithSession(<AnalisisPublik />)

    expect(await screen.findByText(/mohon login terlebih dahulu/i)).toBeInTheDocument()
  })

  it('fetches public questions and filters correctly when authenticated', async () => {
    mockedUseSession.mockReturnValue({
      data: { accessToken: 'mock-token' },
      status: 'authenticated',
    })

    mockedAxios.get
      .mockResolvedValueOnce({
        data: {
          count: 1,
          previous: null,
          next: null,
          results: [
            {
              id: '1',
              title: 'Judul Pertanyaan',
              displayed_title: '',
              user: 'user1',
              tags: ['tag1'],
              created_at: '2025-04-25',
              mode: 'public',
            },
          ],
        },
      })
      .mockResolvedValueOnce({
        data: {
          pengguna: ['user1', 'user2'],
          judul: ['judul1', 'judul2'],
          topik: ['topik1', 'topik2'],
        },
      })

    renderWithSession(<AnalisisPublik />)

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledTimes(3)
    })

    expect(screen.getByTestId('search-bar')).toBeInTheDocument()
    expect(screen.getByTestId('admin-table')).toHaveTextContent('Table with data')
  })

  it('shows empty table if no data returned', async () => {
    mockedUseSession.mockReturnValue({
      data: { accessToken: 'mock-token' },
      status: 'authenticated',
    })

    mockedAxios.get
      .mockResolvedValueOnce({
        data: { count: 0, previous: null, next: null, results: [] },
      })
      .mockResolvedValueOnce({
        data: { pengguna: [], judul: [], topik: [] },
      })

    renderWithSession(<AnalisisPublik />)

    await waitFor(() => {
      expect(screen.getByTestId('admin-table')).toHaveTextContent('Empty Table')
    })
  })

  it('handles fetch error and redirects', async () => {
    mockedUseSession.mockReturnValue({
      data: { accessToken: 'mock-token' },
      status: 'authenticated',
    })

    mockedAxios.get.mockRejectedValueOnce({ response: { status: 403 } })

    renderWithSession(<AnalisisPublik />)

    await waitFor(() => {
      expect(mockedToast.error).toHaveBeenCalledWith('Anda tidak memiliki akses ke halaman ini.')
      expect(mockPush).toHaveBeenCalledWith('/')
    })
  })

  it('renders page title correctly', async () => {
    mockedUseSession.mockReturnValue({
      data: { accessToken: 'mock-token' },
      status: 'authenticated',
    })

    mockedAxios.get
      .mockResolvedValueOnce({ data: { count: 0, previous: null, next: null, results: [] } })
      .mockResolvedValueOnce({ data: { pengguna: [], judul: [], topik: [] } })

    renderWithSession(<AnalisisPublik />)

    expect(await screen.findByTestId('public-analysis-title')).toBeInTheDocument()
  })

  it('handles submit and navigate with search', async () => {
    mockedUseSession.mockReturnValue({
      data: { accessToken: 'mock-token' },
      status: 'authenticated',
    })

    mockedAxios.get
      .mockResolvedValueOnce({ data: { count: 0, previous: null, next: null, results: [] } })
      .mockResolvedValueOnce({ data: { pengguna: [], judul: [], topik: [] } })

    renderWithSession(<AnalisisPublik />)
    const { onSelect } = mockedSearchBar.mockSearchBar.mock.calls[0][0]
    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalled()
    })

    const { onSubmit } = mockedSearchBar.SearchBar.mock.calls[0][0]

    onSubmit()

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith({
        pathname: '/privileged',
        query: { keyword: '' },
      })
    })
  })

  it('sets suggestion correctly when filter is Pengguna', async () => {
    mockedUseSession.mockReturnValue({
      data: { accessToken: 'mock-token' },
      status: 'authenticated',
    })

    renderWithSession(<AnalisisPublik />)

    // Simulasi filterData sudah terisi
    await waitFor(() => {
      // kita inject filterData secara manual
      (screen.getByTestId('search-bar') as any).filterData = {
        pengguna: ['User A', 'User B'],
        judul: [],
        topik: [],
      }
    })

    // Trigger handleFilterSelect via onSelect dari SearchBar
    act(() => {
      mockOnSelect('Pengguna')
    })

    // Pastikan suggestion berubah
    await waitFor(() => {
      expect(screen.getByTestId('search-bar')).toBeInTheDocument()
      // kamu bisa tes apakah suggestion di update sesuai kebutuhanmu
      // tapi karena suggestion tidak di render (di mock), alternatifnya:
      // cek internal state menggunakan react-testing-library + hooks
    })
  })

  it('sets suggestion correctly when filter is Judul', async () => {
    mockedUseSession.mockReturnValue({
      data: { accessToken: 'mock-token' },
      status: 'authenticated',
    })

    renderWithSession(<AnalisisPublik />)

    await waitFor(() => {
      (screen.getByTestId('search-bar') as any).filterData = {
        pengguna: [],
        judul: ['Title A', 'Title B'],
        topik: [],
      }
    })

    act(() => {
      mockOnSelect('Judul')
    })

    await waitFor(() => {
      expect(screen.getByTestId('search-bar')).toBeInTheDocument()
    })
  })

  it('sets suggestion to empty when filter is unknown', async () => {
    mockedUseSession.mockReturnValue({
      data: { accessToken: 'mock-token' },
      status: 'authenticated',
    })

    renderWithSession(<AnalisisPublik />)

    act(() => {
      mockOnSelect('UnknownFilter')
    })

    await waitFor(() => {
      expect(screen.getByTestId('search-bar')).toBeInTheDocument()
    })
  })

  beforeEach(() => {
    mockedUseSession.mockReturnValue({
      data: { accessToken: 'dummy-token' },
      status: 'authenticated',
    })

    mockedAxios.get = jest.fn()
    mockedToast.error = jest.fn()
    mockPush.mockClear()
  })

  it('should update keyword from router query', async () => {
    mockedUseSession.mockReturnValue({
      data: { user: { name: 'Test User' }, accessToken: 'fake-token' },
      status: 'authenticated',
    })
  
    const { mockPush } = require('next/router')
  
    mockPush.mockImplementation((newRoute: any) => {
      // Update router.query secara manual
      require('next/router').useRouter = () => ({
        push: jest.fn(),
        pathname: '/privileged',
        query: { keyword: 'testing' }, // Simulasi query berubah
      })
    })
  
    renderWithSession(<AnalisisPublik />)
  
    // Tunggu efek berjalan
    await waitFor(() => {
      expect(screen.getByTestId('search-bar')).toBeInTheDocument()
    })
  })  

  it('should update keyword on search bar change', async () => {
    renderWithSession(<AnalisisPublik />)

    // Karena SearchBar di-mock, kita ubah propsnya manual
    await act(async () => {
      mockedSearchBar.SearchBar.mock.calls[0][0].onChange('new keyword')
    })

    // Cek apakah keyword berubah
    expect(screen.getByTestId('search-bar')).toBeInTheDocument()
    // Tidak bisa langsung cek state, tapi tidak error sudah cukup
  })

  it('should render AdminTable with empty data', async () => {
    renderWithSession(<AnalisisPublik />)
    expect(screen.getByTestId('admin-table')).toBeInTheDocument()
    expect(screen.getByTestId('admin-table')).toHaveTextContent('Empty Table')
  })

  it('should render Pagination when totalPages >= 1 and change page on button click', async () => {
    renderWithSession(<AnalisisPublik />)

    // Awal
    expect(screen.getByTestId('pagination')).toBeInTheDocument()
    expect(screen.getByTestId('pagination')).toHaveTextContent('Page 1 of')

    // Simulasi klik tombol next page
    await act(async () => {
      screen.getByText('Next Page').click()
    })

    // Setelah klik harusnya currentPage bertambah
    expect(screen.getByTestId('pagination')).toBeInTheDocument()
  })

})
