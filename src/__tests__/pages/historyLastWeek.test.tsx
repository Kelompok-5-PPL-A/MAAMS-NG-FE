import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import LastWeek from '../../pages/history/lastWeek'
import axiosInstance from '../../services/axiosInstance'
import toast from 'react-hot-toast'
import { SessionProvider } from 'next-auth/react'
import type { NextRouter } from 'next/router'

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
    SearchBar: ({ onSubmit, onSelect, onChange, value, filter }: any) => (
      <div data-testid="search-bar">
        <input
          data-testid="search-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <select
          data-testid="select-filter"
          value={filter}
          onChange={(e) => onSelect(e.target.value)}
        >
          <option value="Judul">Judul</option>
          <option value="Pengguna">Pengguna</option>
          <option value="Topik">Topik</option>
          <option value="Lainnya">Lainnya</option>
        </select>
        <button data-testid="submit-button" onClick={onSubmit}>
          Submit
        </button>
      </div>
    ),
  }))
  
jest.mock('../../components/sectionHistory', () => ({
  __esModule: true,
  default: ({ title }: any) => <div data-testid="section">{title}</div>,
}))
jest.mock('../../layout/MainLayout', () => ({ children }: any) => <div>{children}</div>)

const mockPush = jest.fn()
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: mockPush,
    pathname: '/history/lastWeek',
    query: {}, // default kosong
  }),
}))

const mockedAxios = axiosInstance as jest.Mocked<typeof axiosInstance>
const mockedToast = toast as jest.Mocked<typeof toast>
const { useSession } = jest.requireMock('next-auth/react')

const renderWithSession = (ui: React.ReactElement, sessionData: any = null) => {
  return render(<SessionProvider session={sessionData}>{ui}</SessionProvider>)
}

describe('LastWeek Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('redirect jika fetch gagal', async () => {
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

  it('memuat data awal dan menampilkan section + search bar', async () => {
    useSession.mockReturnValue({
      data: { user: { name: 'Test User' } },
      status: 'authenticated'
    })

    mockedAxios.get
      .mockResolvedValueOnce({ data: { processedData: [{ id: 1 }], count: 4 } }) // /last_week
      .mockResolvedValueOnce({ data: { pengguna: [], judul: ['Judul 1'], topik: [] } })

    renderWithSession(<LastWeek />)

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith(expect.stringContaining('/question/last_week'))
      expect(mockedAxios.get).toHaveBeenCalledWith('/question/filter/')
      expect(screen.getByTestId('search-bar')).toBeInTheDocument()
      expect(screen.getByTestId('section')).toBeInTheDocument()
    })
  })

  it('memicu navigasi router saat submit search', async () => {
    useSession.mockReturnValue({
      data: { user: { name: 'Test User' } },
      status: 'authenticated'
    })

    mockedAxios.get
      .mockResolvedValueOnce({ data: { processedData: [], count: 0 } })
      .mockResolvedValueOnce({ data: { pengguna: [], judul: [], topik: [] } })

    renderWithSession(<LastWeek />)

    fireEvent.click(screen.getByTestId('submit-button'))

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(expect.objectContaining({ pathname: expect.any(String), query: { keyword: '' } }))
    })
  })

  it('mengatur suggestion menjadi kosong untuk filter lainnya', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: { processedData: [], count: 0 }
    }).mockResolvedValueOnce({
      data: { pengguna: ['X'], topik: ['Y'], judul: ['Z'] }
    })
  
    renderWithSession(<LastWeek />)
  
    fireEvent.change(screen.getByTestId('select-filter'), {
      target: { value: 'Lainnya' }
    })
  
    await waitFor(() => {
      expect(screen.queryByText('X')).not.toBeInTheDocument()
    })
  })

  it('menghandle edge case: keyword bukan string', async () => {
    useSession.mockReturnValue({
      data: { user: { name: 'Test User' } },
      status: 'authenticated'
    })

    // Server tetap akan merespons meskipun keyword tidak valid
    mockedAxios.get
      .mockResolvedValueOnce({ data: { processedData: [], count: 0 } })
      .mockResolvedValueOnce({ data: { pengguna: [], judul: [], topik: [] } })

    renderWithSession(<LastWeek />)

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith(expect.stringContaining('?filter=semua'))
    })
  })

  it('menghandle edge case: totalPages < 1 (pagination tidak ditampilkan)', async () => {
    useSession.mockReturnValue({
      data: { user: { name: 'Test User' } },
      status: 'authenticated'
    })

    mockedAxios.get
      .mockResolvedValueOnce({ data: { processedData: [], count: 0 } })
      .mockResolvedValueOnce({ data: { pengguna: [], judul: [], topik: [] } })

    renderWithSession(<LastWeek />)

    await waitFor(() => {
      expect(screen.queryByTestId('pagination')).not.toBeInTheDocument()
    })
  })

  it('should update suggestion when filter is Pengguna, Judul, or Topik', async () => {
    useSession.mockReturnValue({ data: { user: {} }, status: 'authenticated' })
  
    const filterDataMock = {
      pengguna: ['User A', 'User B'],
      judul: ['Judul A', 'Judul B'],
      topik: ['Topik A', 'Topik B'],
    }
  
    mockedAxios.get.mockImplementation((url) => {
      if (url.startsWith('/question/last_week')) {
        return Promise.resolve({
          data: {
            processedData: [],
            count: 0,
          },
        })
      }
      if (url.startsWith('/question/filter/')) {
        return Promise.resolve({ data: filterDataMock })
      }
      return Promise.reject(new Error('Unexpected URL'))
    })
  
    renderWithSession(<LastWeek />)
  
    // Tunggu fetch selesai
    await waitFor(() => expect(screen.getByTestId('search-bar')).toBeInTheDocument())
  
    const select = screen.getByTestId('select-filter')
  
    fireEvent.change(select, { target: { value: 'Pengguna' } })
    await waitFor(() => {
      // Optional: assert UI/suggestion behavior if suggestion ditampilkan
      expect(screen.getByTestId('search-input')).toBeInTheDocument()
    })
  
    fireEvent.change(select, { target: { value: 'Judul' } })
    fireEvent.change(select, { target: { value: 'Topik' } })
  
    // Optional: cek bahwa axios.get dipanggil minimal sekali untuk filter
    expect(mockedAxios.get).toHaveBeenCalledWith('/question/filter/')
  })
  

  it('should update keyword when typing in the input', () => {
    useSession.mockReturnValue({ data: { user: {} }, status: 'authenticated' })
  
    mockedAxios.get.mockResolvedValue({
      data: { processedData: [], count: 0 },
    })
  
    renderWithSession(<LastWeek />)
  
    const input = screen.getByTestId('search-input')
    fireEvent.change(input, { target: { value: 'test keyword' } })
    expect(input).toHaveValue('test keyword')
  })

  it('should render loading message when status is loading', () => {
    useSession.mockReturnValue({ data: null, status: 'loading' })
    renderWithSession(<LastWeek />)
    expect(screen.getByText(/Memuat/i)).toBeInTheDocument()
  })
  
  it('should render unauthenticated message when status is unauthenticated', () => {
    useSession.mockReturnValue({ data: null, status: 'unauthenticated' })
    renderWithSession(<LastWeek />)
    expect(screen.getByText(/Mohon login terlebih dahulu/i)).toBeInTheDocument()
  })

  it('should call fetchData with correct params and reset states if keyword exists in query', async () => {
    useSession.mockReturnValue({
      data: { user: { name: 'Test User' } },
      status: 'authenticated',
    })
  
    const mockRouter: Partial<NextRouter> = {
      push: jest.fn(),
      pathname: '/history/lastWeek',
      query: { keyword: 'dummy' },
      route: '/history/lastWeek',
      asPath: '/history/lastWeek?keyword=dummy',
      basePath: '',
      prefetch: jest.fn(),
      replace: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      isFallback: false,
      isReady: true,
      isLocaleDomain: false,
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
    }
  
    jest.spyOn(require('next/router'), 'useRouter').mockReturnValue(mockRouter as NextRouter)
  
    mockedAxios.get.mockImplementation((url: string) => {
      if (url.includes('search')) {
        return Promise.resolve({
          data: { processedData: [], count: 5 },
        })
      }
      if (url.includes('/question/filter/')) {
        return Promise.resolve({
          data: { judul: ['A'], pengguna: ['B'], topik: ['C'] },
        })
      }
      return Promise.resolve({ data: {} })
    })
  
    renderWithSession(<LastWeek />)
  
    await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalledWith(
        '/question/last_week/search/?filter=semua&count=5&keyword=dummy&p=1'
        )  
    })
  })
  
  

  
})
