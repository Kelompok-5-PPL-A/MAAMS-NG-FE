import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react'
import { EditableTitleForm } from '../../components/editableTitleForm'
import axiosInstance from '../../services/axiosInstance'
import toast from 'react-hot-toast'
import '@testing-library/jest-dom'

jest.mock('../../services/axiosInstance')
const mockedAxios = axiosInstance as jest.Mocked<typeof axiosInstance>

const mockPush = jest.fn()
const mockUsePathname = jest.fn()
const mockReload = jest.fn()

jest.mock('next-auth/react', () => ({
  ...jest.requireActual('next-auth/react'),
  useSession: () => ({
    data: {
      user: { name: 'Test User', email: 'test@example.com' },
      accessToken: 'dummy-access',
    },
    status: 'authenticated',
  }),
}))

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

describe('DeleteButton', () => {
  const idQuestion = 'exampleId'
  const title = 'Test Title'
  const mockOnTitleChange = jest.fn()

  it('renders with initial title and enters edit mode when edit button is clicked', () => {
    const { getByText, getByTestId } = render(
      <EditableTitleForm title={title} id={idQuestion} onTitleChange={mockOnTitleChange} />
    )

    expect(getByText(title)).toBeInTheDocument()

    fireEvent.click(getByTestId('edit-title'))

    expect(getByTestId('input-title')).toHaveValue(title)
  })

  it('should close input when clicked outside', () => {
    const { getByTestId } = render(
      <EditableTitleForm title={title} id={idQuestion} onTitleChange={mockOnTitleChange} />
    )

    fireEvent.click(getByTestId('edit-title'))
    const input = getByTestId('input-title')
    expect(input).toBeInTheDocument

    fireEvent.mouseDown(document.body)
    expect(input).not.toBeInTheDocument
  })

  it('displays error when title is empty', async () => {
    jest.requireMock('next/router').useRouter().push('/')

    const { getByTestId } = render(
      <EditableTitleForm title={title} id={idQuestion} onTitleChange={mockOnTitleChange} />
    )

    const edit = getByTestId('edit-title')
    fireEvent.click(edit)

    const input = getByTestId('input-title')
    fireEvent.change(input, { target: { value: '' } })

    const submit = getByTestId('submit-question')
    fireEvent.click(submit)

    await waitFor(() => {
      setTimeout(() => {
        expect(toast.error).toHaveBeenCalledWith('Judul tidak boleh kosong')
      }, 10000)
    })
  })

  it('displays toast when title is the same as before', async () => {
    jest.requireMock('next/router').useRouter().push('/')

    const { getByTestId } = render(
      <EditableTitleForm title={title} id={idQuestion} onTitleChange={mockOnTitleChange} />
    )

    const edit = getByTestId('edit-title')
    fireEvent.click(edit)

    const input = getByTestId('input-title')
    fireEvent.change(input, { target: { value: title } })

    const submit = getByTestId('submit-question')
    fireEvent.click(submit)

    await waitFor(() => {
      setTimeout(() => {
        expect(toast).toHaveBeenCalledWith('Judul sama dengan sebelumnya')
      }, 10000)
    })
  })

  it('displays toast error when title is longer than 40 chars', async () => {
    jest.requireMock('next/router').useRouter().push('/')

    const { getByTestId } = render(
      <EditableTitleForm title={title} id={idQuestion} onTitleChange={mockOnTitleChange} />
    )

    const edit = getByTestId('edit-title')
    fireEvent.click(edit)

    const input = getByTestId('input-title')
    fireEvent.change(input, { target: { value: 'this title is longer than forty characters' } })

    const submit = getByTestId('submit-question')
    fireEvent.click(submit)

    await waitFor(() => {
      setTimeout(() => {
        expect(toast).toHaveBeenCalledWith('Batas panjang judul hanya 40 karakter')
      }, 10000)
    })
  })

  it('should update title successfully', async () => {
    const mockResponseData = {
      message: 'Judul analisis berhasil diubah'
    }
    mockedAxios.patch.mockResolvedValue({ data: mockResponseData })

    jest.spyOn(Object.getPrototypeOf(window.localStorage), 'getItem').mockReturnValueOnce('mockAccessToken')
    jest.spyOn(Object.getPrototypeOf(window.localStorage), 'setItem')

    const { getByTestId } = render(
      <EditableTitleForm title={title} id={idQuestion} onTitleChange={mockOnTitleChange} />
    )

    const edit = getByTestId('edit-title')
    fireEvent.click(edit)

    const input = getByTestId('input-title')
    fireEvent.change(input, { target: { value: 'New Title' } })

    const submit = getByTestId('submit-question')
    fireEvent.click(submit)

    await waitFor(() => {
      setTimeout(() => {
        expect(toast).toHaveBeenCalledWith('Judul analisis berhasil diubah')
      }, 2000)
    })
  })

  it('if failed from backend, should show error from backend', async () => {
    const errorResponse = {
      data: {
        detail: 'Backend Error Message'
      }
    }
    mockedAxios.patch.mockRejectedValueOnce({ response: errorResponse })

    const { getByTestId } = render(
      <EditableTitleForm title={title} id={idQuestion} onTitleChange={mockOnTitleChange} />
    )

    const edit = getByTestId('edit-title')
    fireEvent.click(edit)

    const input = getByTestId('input-title')
    fireEvent.change(input, { target: { value: 'New Title' } })

    const submit = getByTestId('submit-question')
    fireEvent.click(submit)

    await waitFor(() => {
      setTimeout(() => {
        expect(toast).toHaveBeenCalledWith('Backend Error Message')
      }, 2000)
    })
  })

  it('should show error on unsuccessful update', async () => {
    const errorResponse = {
      response: {
        request: {
          responseText: 'Gagal mengubah judul analisis'
        }
      }
    }
    mockedAxios.patch.mockRejectedValueOnce({ data: errorResponse })

    const { getByTestId } = render(
      <EditableTitleForm title={title} id={idQuestion} onTitleChange={mockOnTitleChange} />
    )

    const edit = getByTestId('edit-title')
    fireEvent.click(edit)

    const input = getByTestId('input-title')
    fireEvent.change(input, { target: { value: 'New Title' } })

    const submit = getByTestId('submit-question')
    fireEvent.click(submit)

    await waitFor(() => {
      setTimeout(() => {
        expect(toast).toHaveBeenCalledWith('Gagal mengubah judul analisis')
      }, 2000)
    })
  })
})
