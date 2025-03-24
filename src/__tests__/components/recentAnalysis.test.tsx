import React from 'react'
import { render, waitFor, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import RecentAnalysis from '../../components/recentAnalysis'
import axiosInstance from '../../services/axiosInstance'
import toast from 'react-hot-toast'

jest.mock('../../services/axiosInstance')
const mockedAxios = axiosInstance as jest.Mocked<typeof axiosInstance>

class LocalStorageMock {
  store: { [key: string]: any }
  length: number

  constructor() {
    this.store = {}
    this.length = 0
  }

  getItem(key: string) {
    return this.store[key] || null
  }

  setItem(key: string, value: string) {
    this.store[key] = value.toString()
    this.length = Object.keys(this.store).length
  }

  clear() {
    this.store = {}
    this.length = 0
  }

  key(index: number) {
    return Object.keys(this.store)[index] || null
  }

  removeItem(key: string) {
    delete this.store[key]
    this.length = Object.keys(this.store).length
  }
}
global.localStorage = new LocalStorageMock()

describe('Recent Analysis component', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders correctly when user is logged in via normal login', async () => {
    localStorage.setItem('isLoggedIn', 'true')
    localStorage.setItem('isSSOLoggedIn', 'false') // Pastikan hanya login normal

    const mockResponseData = {
      id: 'mockId',
      title: 'mock',
      mode: 'mock',
      question: 'mock',
      created_at: 'mock',
      username: 'mock'
    }
    mockedAxios.get.mockResolvedValue({ data: mockResponseData })

    render(<RecentAnalysis />)
    await waitFor(() => {
      expect(screen.getByText('Analisis Terbaru')).toBeInTheDocument()
    })
  })

  it('renders correctly when user is logged in via SSO UI', async () => {
    localStorage.setItem('isLoggedIn', 'false')
    localStorage.setItem('isSSOLoggedIn', 'true') // SSO aktif

    const mockResponseData = {
      id: 'mockId',
      title: 'mock',
      mode: 'mock',
      question: 'mock',
      created_at: 'mock',
      username: 'mock'
    }
    mockedAxios.get.mockResolvedValue({ data: mockResponseData })

    render(<RecentAnalysis />)
    await waitFor(() => {
      expect(screen.getByText('Analisis Terbaru')).toBeInTheDocument()
    })
  })

  it('shows toast when failed to get data', async () => {
    localStorage.setItem('isLoggedIn', 'true')

    const errorResponse = {
      response: {
        request: {
          responseText: 'Gagal mengambil data'
        }
      }
    }
    mockedAxios.get.mockRejectedValueOnce({ data: errorResponse })

    render(<RecentAnalysis />)
    await waitFor(() => {
      setTimeout(() => {
        expect(toast).toHaveBeenCalledWith('Gagal mengambil data')
      }, 2000)
    })
  })

  it('does not render when user is not logged in (normal or SSO)', () => {
    localStorage.setItem('isLoggedIn', 'false')
    localStorage.setItem('isSSOLoggedIn', 'false')

    render(<RecentAnalysis />)
    const element = screen.queryByText('Analisis Terbaru')

    expect(element).toBeNull()
  })
})
