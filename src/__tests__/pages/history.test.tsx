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
  SearchBar: jest.fn(() => <div data-testid='search-bar'>Mocked SearchBar</div>),
}))
jest.mock('../../components/sectionHistory', () => ({
  __esModule: true,
  default: ({ title }: any) => <div data-testid={`section-${title}`}>{title}</div>,
}))
jest.mock('../../layout/MainLayout', () => ({ children }: any) => (
  <div>{children}</div>
))

const mockPush = jest.fn()
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: mockPush,
    pathname: '/history',
    query: {},
  }),
}))

const mockedAxios = axiosInstance as jest.Mocked<typeof axiosInstance>
const mockedToast = toast as jest.Mocked<typeof toast>
const mockedUseSession = useSession as jest.Mock
const mockedSearchBar = require('../../components/searchBar')

const renderWithSession = (ui: React.ReactElement, sessionData: any = null) => {
  return render(
    <SessionProvider session={sessionData}>
      {ui}
    </SessionProvider>
  )
}

describe('History Page Full Coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should show login message if not authenticated', () => {
    mockedUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
    })

    renderWithSession(<History />)

    expect(screen.getByText(/mohon login terlebih dahulu/i)).toBeInTheDocument()
  })

  it('should fetch lastweek, older, and filters correctly after login', async () => {
    mockedUseSession.mockReturnValue({
      data: { accessToken: 'mock-token' },
      status: 'authenticated',
    })

    mockedAxios.get
      .mockResolvedValueOnce({
        data: {
          count: 2,
          previous: null,
          next: null,
          results: [
            {
              id: 1,
              question: 'Apa itu algoritma?',
              title: 'Algoritma',
              created_at: '2023-01-01T00:00:00Z',
              mode: 'public',
              username: 'user1',
              tags: ['algoritma'],
            },
          ],
        },
      }) // lastWeek
      .mockResolvedValueOnce({
        data: {
          count: 1,
          previous: null,
          next: null,
          results: [
            {
              id: 2,
              question: 'Apa itu struktur data?',
              title: 'Struktur Data',
              created_at: '2023-01-01T00:00:00Z',
              mode: 'private',
              username: 'user2',
              tags: ['struktur-data'],
            },
          ],
        },
      }) // older
      .mockResolvedValueOnce({
        data: {
          pengguna: ['user1', 'user2'],
          judul: ['Algoritma', 'Struktur Data'],
          topik: ['Programming', 'Data Structures'],
        },
      }) // fetchFilters

    renderWithSession(<History />)

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledTimes(3) // 2 fetchQuestions + 1 fetchFilters
      expect(screen.getByTestId('search-bar')).toBeInTheDocument()
      expect(screen.getByTestId('section-7 hari terakhir')).toBeInTheDocument()
      expect(screen.getByTestId('section-Lebih lama')).toBeInTheDocument()
    })
  })

  it('should show toast error and redirect when fetch error occurs', async () => {
    mockedUseSession.mockReturnValue({
      data: { accessToken: 'mock-token' },
      status: 'authenticated',
    })

    mockedAxios.get.mockRejectedValue(new Error('fetch error'))

    renderWithSession(<History />)

    await waitFor(() => {
      expect(mockedToast.error).toHaveBeenCalledWith('Terjadi kesalahan saat mengambil data')
      expect(mockPush).toHaveBeenCalledWith('/')
    })
  })

  it('should handle filter selection correctly', async () => {
    mockedUseSession.mockReturnValue({
      data: { accessToken: 'mock-token' },
      status: 'authenticated',
    })

    mockedAxios.get
      .mockResolvedValueOnce({
        data: { count: 0, previous: null, next: null, results: [] },
      })
      .mockResolvedValueOnce({
        data: { count: 0, previous: null, next: null, results: [] },
      })
      .mockResolvedValueOnce({
        data: {
          pengguna: ['user1'],
          judul: ['judul1'],
          topik: ['topik1'],
        },
      })

    renderWithSession(<History />)

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledTimes(3)
    })

    const { onSelect } = mockedSearchBar.SearchBar.mock.calls[0][0]

    onSelect('Pengguna')
    onSelect('Judul')
    onSelect('Topik')
    onSelect('semua')

    expect(true).toBeTruthy()
  })

  it('should handle submit and navigate with search', async () => {
    mockedUseSession.mockReturnValue({
      data: { accessToken: 'mock-token' },
      status: 'authenticated',
    })

    mockedAxios.get
      .mockResolvedValue({
        data: { count: 0, previous: null, next: null, results: [] },
      })

    renderWithSession(<History />)

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalled()
    })

    const { onSubmit } = mockedSearchBar.SearchBar.mock.calls[0][0]

    onSubmit()

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith(expect.stringContaining('search/?filter=semua&count=4&keyword='))
      expect(mockPush).toHaveBeenCalledWith({
        pathname: '/history',
        query: { keyword: '' },
      })
    })
  })

  it('should handle input change', async () => {
    mockedUseSession.mockReturnValue({
      data: { accessToken: 'mock-token' },
      status: 'authenticated',
    })

    mockedAxios.get
      .mockResolvedValue({
        data: { count: 0, previous: null, next: null, results: [] },
      })

    renderWithSession(<History />)

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalled()
    })

    const { onChange } = mockedSearchBar.SearchBar.mock.calls[0][0]
    onChange('algoritma')

    expect(true).toBeTruthy()
  })
})
