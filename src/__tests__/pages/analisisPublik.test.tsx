import React from 'react'
import { render, fireEvent, waitFor, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import AnalisisPublik from '../../pages/analisisPublik'
import { fetchQuestions } from '../../actions/fetchQuestions'
import { fetchFilters } from '../../actions/fetchFilters'
import { SessionProvider, useSession } from 'next-auth/react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/router'

// Mocks
jest.mock('../../actions/fetchQuestions', () => ({
  fetchQuestions: jest.fn(() => Promise.resolve({ processedData: [], count: 0 }))
}))
jest.mock('../../actions/fetchFilters', () => ({
  fetchFilters: jest.fn(() => Promise.resolve({
    pengguna: ['User1', 'User2'],
    judul: ['Title1', 'Title2'],
    topik: ['Topic1', 'Topic2']
  }))
}))
jest.mock('react-hot-toast')
jest.mock('next-auth/react', () => ({
  ...jest.requireActual('next-auth/react'),
  useSession: jest.fn()
}))
const mockPush = jest.fn()
jest.mock('next/router', () => ({
  useRouter: jest.fn()
}))

// Setup mock localStorage
class LocalStorageMock {
  store: { [key: string]: any }
  length: number

  constructor() {
    this.store = {}
    this.length = 0
  }

  getItem = jest.fn((key: string) => this.store[key] || null)
  setItem = jest.fn((key: string, value: string) => {
    this.store[key] = value.toString()
    this.length = Object.keys(this.store).length
  })
  removeItem = jest.fn((key: string) => {
    delete this.store[key]
    this.length = Object.keys(this.store).length
  })
  clear = jest.fn(() => {
    this.store = {}
    this.length = 0
  })
  key = jest.fn((index: number) => Object.keys(this.store)[index] || null)
}

global.localStorage = new LocalStorageMock()

const mockedFetchQuestions = fetchQuestions as jest.MockedFunction<typeof fetchQuestions>
const mockedFetchFilters = fetchFilters as jest.MockedFunction<typeof fetchFilters>
const mockedUseSession = useSession as jest.Mock
const mockedUseRouter = useRouter as jest.Mock

const renderWithSession = (ui: React.ReactElement, sessionData: any = null) => {
  return render(
    <SessionProvider session={sessionData}>
      {ui}
    </SessionProvider>
  )
}

describe('AnalisisPublik Full Coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockedUseSession.mockReturnValue({ data: { accessToken: 'mock-token' }, status: 'authenticated' })
    mockedUseRouter.mockReturnValue({ query: {}, push: mockPush, reload: jest.fn(), pathname: '/analisis-publik' })
  })

  it('renders title correctly', async () => {
    renderWithSession(<AnalisisPublik />)
    expect(await screen.findByTestId('public-analysis-title')).toBeInTheDocument()
  })

  it('fetches questions and filters on mount', async () => {
    renderWithSession(<AnalisisPublik />)
    await waitFor(() => {
      expect(mockedFetchQuestions).toHaveBeenCalled()
      expect(mockedFetchFilters).toHaveBeenCalled()
    })
  })

  it('handles search bar input change', async () => {
    renderWithSession(<AnalisisPublik />)
    const input = screen.getByPlaceholderText('Cari analisis..')
    fireEvent.change(input, { target: { value: 'test search' } })
    expect(input).toHaveValue('test search')
  })

  it('handles search button click', async () => {
    renderWithSession(<AnalisisPublik />)
    const input = screen.getByPlaceholderText('Cari analisis..')
    const button = screen.getByTestId('search-button')
    fireEvent.change(input, { target: { value: 'test search' } })
    fireEvent.click(button)
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalled()
    })
  })

  it('handles pagination button click', async () => {
    renderWithSession(<AnalisisPublik />)
    const pageButton = await screen.findByText('1')
    fireEvent.click(pageButton)
    await waitFor(() => {
      expect(mockedFetchQuestions).toHaveBeenCalledTimes(2) // initial + after page change
    })
  })

  it('handles filter selection and clears suggestions', async () => {
    const { getByTestId } = renderWithSession(<AnalisisPublik />)
    const filterSelect = getByTestId('filter-select')
    fireEvent.change(filterSelect, { target: { value: 'other' } })
    await waitFor(() => {
      const suggestionList = getByTestId('suggestion-list')
      expect(suggestionList.children.length).toBe(0)
    })
  })

  it('handles suggestion selection', async () => {
    renderWithSession(<AnalisisPublik />)
    const suggestionItem = await screen.findByText('User1')
    fireEvent.click(suggestionItem)
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Cari analisis..')).toHaveValue('User1')
    })
  })

  it('handles fetch error gracefully', async () => {
    mockedFetchQuestions.mockRejectedValueOnce(new Error('fetch error'))
    const mockedToast = toast as jest.Mocked<typeof toast>

    renderWithSession(<AnalisisPublik />)

    await waitFor(() => {
      expect(mockedToast.error).toHaveBeenCalledWith('Gagal memuat data, silakan coba lagi.')
    })
  })

  it('shows login warning when unauthenticated', async () => {
    mockedUseSession.mockReturnValueOnce({ data: null, status: 'unauthenticated' })
    renderWithSession(<AnalisisPublik />)
    expect(await screen.findByText(/mohon login terlebih dahulu/i)).toBeInTheDocument()
  })

  it('shows forbidden warning for non-admin users', async () => {
    mockedUseSession.mockReturnValueOnce({ 
      data: { 
        accessToken: 'mock-token', 
        user: { is_superuser: false, is_staff: false } 
      }, 
      status: 'authenticated' 
    })
  
    renderWithSession(<AnalisisPublik />)
    expect(await screen.findByText(/mohon login terlebih dahulu/i)).toBeInTheDocument()
  })  
})
