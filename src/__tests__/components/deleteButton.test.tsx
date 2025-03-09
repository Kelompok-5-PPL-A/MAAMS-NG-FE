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
    jest.spyOn(localStorage.__proto__, 'getItem').mockReturnValueOnce('mockAccessToken')
    const { getByTestId, getByText } = render(<DeleteButton idQuestion={idQuestion} pathname={pathname} />)
    
    fireEvent.click(getByTestId('toggle-open-button'))
    fireEvent.click(getByTestId('delete-button'))
    fireEvent.click(getByText('Hapus'))

    await waitFor(() => expect(toast.success).toHaveBeenCalledWith('Berhasil menghapus analisis'))
  })

  it('should delete successfully from history page', async () => {
    mockedAxios.delete.mockResolvedValue({ data: { message: 'Analisis berhasil dihapus' } })
    jest.spyOn(localStorage.__proto__, 'getItem').mockReturnValueOnce('mockAccessToken')
    const { getByTestId, getByText } = render(<DeleteButton idQuestion={idQuestion} pathname='/history' />)
    
    fireEvent.click(getByTestId('toggle-open-button'))
    fireEvent.click(getByTestId('delete-button'))
    fireEvent.click(getByText('Hapus'))

    await waitFor(() => expect(toast.success).toHaveBeenCalledWith('Berhasil menghapus analisis'))
  })

  it('should show error message when deletion fails', async () => {
    mockedAxios.delete.mockRejectedValueOnce({ response: { data: { detail: 'Backend Error Message' } } })
    const { getByTestId, getByText } = render(<DeleteButton idQuestion={idQuestion} pathname={pathname} />)
    
    fireEvent.click(getByTestId('toggle-open-button'))
    fireEvent.click(getByTestId('delete-button'))
    fireEvent.click(getByText('Hapus'))

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Backend Error Message'))
  })

  it('should handle delete request failure without response', async () => {
    mockedAxios.delete.mockRejectedValueOnce(new Error('Network Error'))
    const { getByTestId, getByText } = render(<DeleteButton idQuestion={idQuestion} pathname={pathname} />)
    
    fireEvent.click(getByTestId('toggle-open-button'))
    fireEvent.click(getByTestId('delete-button'))
    fireEvent.click(getByText('Hapus'))

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Gagal menghapus analisis'))
  })

  it('should not call delete API if no access token is found', async () => {
    jest.spyOn(localStorage.__proto__, 'getItem').mockReturnValueOnce(null)
    const { getByTestId, getByText } = render(<DeleteButton idQuestion={idQuestion} pathname={pathname} />)
    
    fireEvent.click(getByTestId('toggle-open-button'))
    fireEvent.click(getByTestId('delete-button'))
    fireEvent.click(getByText('Hapus'))

    await waitFor(() => expect(mockedAxios.delete).not.toHaveBeenCalled())
  })
})
