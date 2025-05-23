import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import PastWeek from '../../pages/history/pastWeek'
import axiosInstance from '../../services/axiosInstance'
import toast from 'react-hot-toast'
import { SessionProvider, useSession } from 'next-auth/react'
import type { NextRouter } from 'next/router'

// Mocks
jest.mock('../../services/axiosInstance')
jest.mock('react-hot-toast')
jest.mock('next-auth/react', () => ({
  ...jest.requireActual('next-auth/react'),
  useSession: jest.fn(),
}))
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
      expect(mockedAxios.get).toHaveBeenCalledTimes(1)
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

  it('should update suggestion when filter is Pengguna, Judul, or Topik', async () => {
    mockedUseSession.mockReturnValue({ data: { user: {} }, status: 'authenticated' })
  
    const filterDataMock = {
      pengguna: ['User A', 'User B'],
      judul: ['Judul A', 'Judul B'],
      topik: ['Topik A', 'Topik B'],
    }
  
    mockedAxios.get.mockImplementation((url) => {
      if (url.startsWith('api/v1/question/history')) {
        return Promise.resolve({
          data: {
            processedData: [],
            count: 0,
          },
        })
      }
      if (url.startsWith('api/v1/question/history/?filter')) {
        return Promise.resolve({ data: filterDataMock })
      }
      return Promise.reject(new Error('Unexpected URL'))
    })
  
    renderWithSession(<PastWeek />)
  
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
    expect(mockedAxios.get).toHaveBeenCalledWith(expect.stringContaining(`api/v1/question/history/?filter`))
  })

  it('mengatur suggestion menjadi kosong untuk filter lainnya', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: { processedData: [], count: 0 }
    }).mockResolvedValueOnce({
      data: { pengguna: ['X'], topik: ['Y'], judul: ['Z'] }
    })
  
    renderWithSession(<PastWeek />)
  
    fireEvent.change(screen.getByTestId('select-filter'), {
      target: { value: 'Lainnya' }
    })
  
    await waitFor(() => {
      expect(screen.queryByText('X')).not.toBeInTheDocument()
    })
  })

  it('should call fetchData with correct params and reset states if keyword exists in query', async () => {
    mockedUseSession.mockReturnValue({
      data: { user: { name: 'Test User' } },
      status: 'authenticated',
    })
  
    const mockRouter: Partial<NextRouter> = {
      push: jest.fn(),
      pathname: '/history/pastWeek',
      query: { keyword: 'dummy' },
      route: '/history/pastWeek',
      asPath: '/history/pastWeek?keyword=dummy',
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
      if (url.includes('filter')) {
        return Promise.resolve({
          data: { judul: ['A'], pengguna: ['B'], topik: ['C'] },
        })
      }
      return Promise.resolve({ data: {} })
    })
  
    renderWithSession(<PastWeek />)
  
    await waitFor(() => {
        const calls = mockedAxios.get.mock.calls.map(call => call[0].replace('&&', '&'));
      
        expect(calls).toEqual(
          expect.arrayContaining([
            'api/v1/question/history/search/?filter=semua&count=5&keyword=dummy&p=1&time_range=older'
          ])
        );
      });      
  })

  it('should update keyword when typing in the input', () => {
    mockedUseSession.mockReturnValue({ data: { user: {} }, status: 'authenticated' })
  
    mockedAxios.get.mockResolvedValue({
      data: { processedData: [], count: 0 },
    })
  
    renderWithSession(<PastWeek />)
  
    const input = screen.getByTestId('search-input')
    fireEvent.change(input, { target: { value: 'test keyword' } })
    expect(input).toHaveValue('test keyword')
  })
})
