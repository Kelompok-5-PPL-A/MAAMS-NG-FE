import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react'
import { DeleteButton } from '../../components/deleteButton'
import axiosInstance from '../../services/axiosInstance'
import toast from 'react-hot-toast'

jest.mock('../../services/axiosInstance')
const mockedAxios = axiosInstance as jest.Mocked<typeof axiosInstance>

const mockPush = jest.fn()
const mockUsePathname = jest.fn()
const mockReload = jest.fn()
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: mockPush,
    reload: mockReload
  }),
  usePathName: () => ({
    pathname: mockUsePathname
  })
}))

beforeEach(() => {
  localStorage.clear()
  jest.clearAllMocks()
})

afterEach(() => {
  localStorage.clear()
  jest.clearAllMocks()
})

describe('DeleteButton', () => {
  const idQuestion = 'exampleId'
  const pathname = 'example'

  it('should render without errors', () => {
    const { getByTestId } = render(<DeleteButton idQuestion={idQuestion} pathname={pathname} />)
    expect(getByTestId('toggle-open-button')).toBeInTheDocument()
  })

  it('should open and close dropdown menu correctly', () => {
    const { getByTestId, queryByTestId } = render(<DeleteButton idQuestion={idQuestion} pathname={pathname} />)
    const toggleButton = getByTestId('toggle-open-button')
    fireEvent.click(toggleButton)
    expect(getByTestId('delete-button')).toBeInTheDocument()
    fireEvent.mouseDown(document.body)
    expect(queryByTestId('delete-button')).not.toBeInTheDocument()
  })

  it('should delete successfully', async () => {
    mockedAxios.delete.mockResolvedValue({ data: { message: 'Analisis berhasil dihapus' } })
    
    // Mock localStorage
    const mockGetItem = jest.fn().mockReturnValue('mockAccessToken')
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: mockGetItem
      },
      writable: true
    })

    const { getByTestId, getByText } = render(<DeleteButton idQuestion={idQuestion} pathname={pathname} />)
    
    fireEvent.click(getByTestId('toggle-open-button'))
    fireEvent.click(getByText('Hapus'))
    
    await waitFor(() => {
      expect(mockedAxios.delete).toHaveBeenCalledWith(
        `${process.env.NEXT_PUBLIC_API_URL}/api/analysis/${idQuestion}`,
        expect.any(Object)
      )
    })
  })

  it('should delete successfully from history page', async () => {
    mockedAxios.delete.mockResolvedValue({ data: { message: 'Analisis berhasil dihapus' } })
    
    // Mock localStorage
    const mockGetItem = jest.fn().mockReturnValue('mockAccessToken')
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: mockGetItem
      },
      writable: true
    })

    const { getByTestId, getByText } = render(<DeleteButton idQuestion={idQuestion} pathname='/history' />)
    
    fireEvent.click(getByTestId('toggle-open-button'))
    fireEvent.click(getByText('Hapus'))
    
    await waitFor(() => {
      expect(mockedAxios.delete).toHaveBeenCalledWith(
        `${process.env.NEXT_PUBLIC_API_URL}/api/analysis/${idQuestion}`,
        expect.any(Object)
      )
    })
  })

  it('should show error message when deletion fails', async () => {
    mockedAxios.delete.mockRejectedValueOnce({ response: { data: { detail: 'Backend Error Message' } } })
    const { getByTestId, getByText } = render(<DeleteButton idQuestion={idQuestion} pathname={pathname} />)
    
    fireEvent.click(getByTestId('toggle-open-button'))
    fireEvent.click(getByTestId('delete-button'))
    fireEvent.click(getByText('Hapus'))

    await waitFor(() => {
      setTimeout(() => {
        expect(toast.error).toHaveBeenCalledWith('Backend Error Message')
      }, 10000)
    })
    
  })

  it('should handle delete request failure without response', async () => {
    mockedAxios.delete.mockRejectedValueOnce(new Error('Network Error'))
    const { getByTestId, getByText } = render(<DeleteButton idQuestion={idQuestion} pathname={pathname} />)
    
    fireEvent.click(getByTestId('toggle-open-button'))
    fireEvent.click(getByTestId('delete-button'))
    fireEvent.click(getByText('Hapus'))

    await waitFor(() => {
        setTimeout(() => {
          expect(toast.error).toHaveBeenCalledWith('Gagal menghapus analisis')
        }, 10000)
      })      
  })
})
