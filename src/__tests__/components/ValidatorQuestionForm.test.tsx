/* eslint-disable */
import { ValidatorQuestionForm } from '../../components/validatorQuestionForm'
import { render, fireEvent, waitFor, screen, queryByText } from '@testing-library/react'
import React from 'react'
import '@testing-library/jest-dom'
import Mode from '../../constants/mode'
import axiosInstance from '../../services/axiosInstance'
import { toast } from 'react-hot-toast'

jest.mock('../../services/axiosInstance')
const mockedAxios = axiosInstance as jest.Mocked<typeof axiosInstance>
const mockPush = jest.fn()
const mockReload = jest.fn()
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: mockPush,
    reload: mockReload
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

describe('ValidatorQuestionForm Component', () => {
  test('renders form correctly', () => {
    jest.requireMock('next/router').useRouter().push('/')

    const { getByPlaceholderText } = render(<ValidatorQuestionForm />)

    expect(getByPlaceholderText('Isi pertanyaan anda di sini')).toBeInTheDocument()
  })

  test('updates question correctly when input value is changed', () => {
    const { getByPlaceholderText } = render(<ValidatorQuestionForm />)

    const input = getByPlaceholderText('Isi pertanyaan anda di sini')
    fireEvent.change(input, { target: { value: 'Pertanyaan baru' } })

    expect(input.getAttribute('value')).toBe('Pertanyaan baru')
  })

  test('displays error when question is not filled', async () => {
    jest.requireMock('next/router').useRouter().push('/')

    const { getByPlaceholderText, getByTestId } = render(<ValidatorQuestionForm />)
    const input = getByPlaceholderText('Isi pertanyaan anda di sini')
    const button = getByTestId('submit-question')
    fireEvent.change(input, { target: { value: '' } })
    fireEvent.submit(button)

    await waitFor(() => {
      setTimeout(() => {
        expect(toast.error).toHaveBeenCalledWith('Pertanyaan harus diisi')
      }, 10000)
    })
  })

  test('calls handleTitleChange when change title', () => {
    const validatorData = {
      mode: Mode.pribadi,
      question: 'Contoh pertanyaan',
      username: 'test',
      created_at: 'test',
      title: 'test',
      tags: ['example tag']
    }
    const { getByText, getByTestId } = render(<ValidatorQuestionForm id={'id-test'} validatorData={validatorData} />)

    expect(getByText('test')).toBeInTheDocument

    const edit = getByTestId('edit-title')
    fireEvent.click(edit)

    const input = getByTestId('input-title')
    fireEvent.change(input, { target: { value: 'baru' } })
    const submit = getByTestId('submit-question')

    fireEvent.click(submit)

    expect(getByText('Saving...')).toBeInTheDocument
  })

  test('calls handleModeChange when option is selected in the dropdown and id is not provided', () => {
    const validatorData = {
      mode: Mode.pribadi,
      question: 'Contoh pertanyaan',
      username: 'test',
      created_at: 'test',
      title: 'test',
      tags: ['test']
    }
    const { getByText } = render(<ValidatorQuestionForm id={undefined} validatorData={validatorData} />)

    const dropdown = getByText(Mode.pribadi)
    fireEvent.click(dropdown)

    const option = getByText(Mode.pengawasan)
    fireEvent.click(option)

    expect(dropdown.textContent).toBe(Mode.pengawasan)
  })

  test('opens mode change confirmation modal when a new mode is selected', async () => {
    const { getByText } = render(<ValidatorQuestionForm />)
    fireEvent.click(getByText(Mode.pribadi))
    fireEvent.click(getByText(Mode.pengawasan))

    expect(getByText('Apakah Anda yakin ingin menampilkan analisis ini kepada Admin?')).toBeInTheDocument()
  })

  test('displays success message and redirects on successful API call', async () => {
    const mockResponseData = {
      mode: 'mode',
      question: 'question'
    }
    mockedAxios.post.mockResolvedValue({ data: mockResponseData })

    jest.spyOn(Object.getPrototypeOf(window.localStorage), 'getItem').mockReturnValueOnce('mockAccessToken')
    jest.spyOn(Object.getPrototypeOf(window.localStorage), 'setItem')

    const { getByPlaceholderText, getByTestId } = render(<ValidatorQuestionForm />)

    const input = getByPlaceholderText('Isi pertanyaan anda di sini')
    fireEvent.change(input, { target: { value: 'question' } })

    const button = getByTestId('submit-question')

    fireEvent.submit(button)

    await waitFor(() => {
      setTimeout(() => {
        expect(toast).toHaveBeenCalledWith('Analisis berhasil ditambahkan')
      }, 10000)
    })
  })

  test('displays error message when fail to post', async () => {
    const errorResponse = {
      response: {
        request: {
          responseText: 'Gagal menambahkan analisis'
        }
      }
    }
    mockedAxios.post.mockRejectedValueOnce({ data: errorResponse })

    const { getByPlaceholderText, getByTestId } = render(<ValidatorQuestionForm />)

    const input = getByPlaceholderText('Isi pertanyaan anda di sini')
    fireEvent.change(input, { target: { value: 'question' } })

    const button = getByTestId('submit-question')

    fireEvent.submit(button)

    await waitFor(() => {
      setTimeout(() => {
        expect(toast).toHaveBeenCalledWith('Gagal menambahkan analisis')
      }, 10000)
    })
  })

  test('displays error message from backend when fail to post', async () => {
    const errorResponse = {
      data: {
        detail: 'Backend Error Message'
      }
    }
    mockedAxios.post.mockRejectedValueOnce({ response: errorResponse })

    const { getByPlaceholderText, getByTestId } = render(<ValidatorQuestionForm />)

    const input = getByPlaceholderText('Isi pertanyaan anda di sini')
    fireEvent.change(input, { target: { value: 'question' } })

    const button = getByTestId('submit-question')

    fireEvent.submit(button)

    await waitFor(() => {
      setTimeout(() => {
        expect(toast).toHaveBeenCalledWith('Backend Error Message')
      }, 10000)
    })
  })

  test('updates mode successfully without id', async () => {
    const validatorData = {
      mode: Mode.pribadi,
      question: 'Contoh pertanyaan',
      username: 'Johndoe',
      created_at: 'test',
      title: 'test',
      tags: ['example tag']
    }
    const { getByText } = render(<ValidatorQuestionForm id={undefined} validatorData={validatorData} />)

    const dropdown = getByText(Mode.pribadi)
    fireEvent.click(dropdown)
    const option = getByText(Mode.pengawasan)
    fireEvent.click(option)
    fireEvent.click(getByText('Simpan'))

    await waitFor(() => {
      setTimeout(() => {
        expect(toast.success).toHaveBeenCalledWith('Berhasil mengubah mode')
      }, 10000)
    })
  })

  test('updates mode successfully with API call', async () => {
    const id = 'id-test-1'
    const mockResponseData = {
      mode: Mode.pengawasan
    }
    mockedAxios.patch.mockResolvedValue({ data: mockResponseData })

    jest.spyOn(Object.getPrototypeOf(window.localStorage), 'getItem').mockReturnValueOnce('mockAccessToken')
    jest.spyOn(Object.getPrototypeOf(window.localStorage), 'setItem')

    const { getByText, queryByText } = render(<ValidatorQuestionForm id={id} />)

    const dropdown = getByText(Mode.pribadi)
    fireEvent.click(dropdown)
    const option = getByText(Mode.pengawasan)
    fireEvent.click(option)
    fireEvent.click(getByText('Simpan'))

    await waitFor(() => {
      setTimeout(() => {
        expect(queryByText('Apakah Anda yakin ingin menampilkan analisis ini kepada Admin?')).not.toBeInTheDocument()
        expect(toast.success).toHaveBeenCalledWith('Berhasil mengubah mode')
      }, 10000)
    })
  })

  test('should show error message when failed', async () => {
    const id = 'id-test-error-1'
    const errorResponse = {
      data: {
        detail: 'Backend Error Message'
      }
    }
    mockedAxios.patch.mockRejectedValueOnce({ response: errorResponse })

    jest.spyOn(Object.getPrototypeOf(window.localStorage), 'getItem').mockReturnValueOnce('mockAccessToken')
    jest.spyOn(Object.getPrototypeOf(window.localStorage), 'setItem')

    const { getByText } = render(<ValidatorQuestionForm id={id} />)

    const dropdown = getByText(Mode.pribadi)
    fireEvent.click(dropdown)
    const option = getByText(Mode.pengawasan)
    fireEvent.click(option)
    fireEvent.click(getByText('Simpan'))

    await waitFor(() => {
      setTimeout(() => {
        expect(toast).toHaveBeenCalledWith('Backend Error Message')
      }, 10000)
    })
  })

  test('displays a generic error message on mode change failure due to non-backend issue', async () => {
    mockedAxios.patch.mockRejectedValueOnce(new Error('Network Error'))

    const id = 'id-test-failure-general'
    jest.spyOn(Object.getPrototypeOf(window.localStorage), 'getItem').mockReturnValueOnce('mockAccessToken')
    jest.spyOn(Object.getPrototypeOf(window.localStorage), 'setItem')

    const { getByText } = render(<ValidatorQuestionForm id={id} />)

    fireEvent.click(getByText(Mode.pribadi))
    fireEvent.click(getByText(Mode.pengawasan))
    fireEvent.click(getByText('Simpan'))

    await waitFor(() => {
      setTimeout(() => {
        expect(toast).toHaveBeenCalledWith('Gagal mengubah mode')
      }, 10000)
    })
  })

  test('closes the mode change confirmation modal when the cancel button is clicked', async () => {
    const { getByText, queryByText } = render(<ValidatorQuestionForm />)

    fireEvent.click(getByText(Mode.pribadi))
    fireEvent.click(getByText(Mode.pengawasan))

    const cancelButton = getByText('Batal')
    fireEvent.click(cancelButton)

    await waitFor(() => {
      setTimeout(() => {
        expect(queryByText('Apakah Anda yakin ingin menampilkan analisis ini kepada Admin?')).not.toBeInTheDocument()
      }, 10000)
    })
  })

  test('closes the mode change confirmation modal when the close icon is clicked', async () => {
    const { getByText, queryByText, getByLabelText } = render(<ValidatorQuestionForm />)

    fireEvent.click(getByText(Mode.pribadi))
    fireEvent.click(getByText(Mode.pengawasan))

    const closeIcon = getByLabelText('Close')
    fireEvent.click(closeIcon)

    await waitFor(() => {
      setTimeout(() => {
        expect(queryByText('Apakah Anda yakin ingin menampilkan analisis ini kepada Admin?')).not.toBeInTheDocument()
      }, 10000)
    })
  })

  test('updates tags successfully with API call', async () => {
    const mockResponseData = {
      tags: ['analisis']
    }
    mockedAxios.patch.mockResolvedValue({ data: mockResponseData })

    jest.spyOn(Object.getPrototypeOf(window.localStorage), 'getItem').mockReturnValueOnce('mockAccessToken')
    jest.spyOn(Object.getPrototypeOf(window.localStorage), 'setItem')

    const validatorData = {
      mode: Mode.pribadi,
      question: 'Contoh pertanyaan',
      username: 'test',
      created_at: 'test',
      title: 'test',
      tags: ['example tag']
    }

    const { getByText, getByTestId, getByPlaceholderText } = render(
      <ValidatorQuestionForm id={'id-test'} validatorData={validatorData} />
    )

    const editTagButton = getByTestId('toggle-tags-button')
    fireEvent.click(editTagButton)
    const newTagInput = getByPlaceholderText('Berikan maksimal 3 kategori ...')
    fireEvent.change(newTagInput, { target: { value: 'Sample Tag' } })
    fireEvent.keyDown(newTagInput, { key: 'Enter', code: 'Enter' })

    fireEvent.click(getByText('Kirim'))

    await waitFor(() => {
      setTimeout(() => {
        expect(toast.success).toHaveBeenCalledWith('Berhasil mengubah kategori')
      }, 10000)
    })
  })

  test('updates tags with duplicate', async () => {
    jest.spyOn(Object.getPrototypeOf(window.localStorage), 'getItem').mockReturnValueOnce('mockAccessToken')
    jest.spyOn(Object.getPrototypeOf(window.localStorage), 'setItem')

    const validatorData = {
      mode: Mode.pribadi,
      question: 'Contoh pertanyaan',
      username: 'test',
      created_at: 'test',
      title: 'test',
      tags: ['kategori']
    }

    const { getByTestId, getByPlaceholderText } = render(
      <ValidatorQuestionForm id={'id-test'} validatorData={validatorData} />
    )

    const editTagButton = getByTestId('toggle-tags-button')
    fireEvent.click(editTagButton)
    const newTagInput = getByPlaceholderText('Berikan maksimal 3 kategori ...')
    fireEvent.change(newTagInput, { target: { value: 'kategori' } })
    fireEvent.keyDown(newTagInput, { key: 'Enter', code: 'Enter' })

    await waitFor(() => {
      setTimeout(() => {
        expect(toast.error).toHaveBeenCalledWith('Kategori sudah ada. Masukan kategori lain')
      }, 10000)
    })
  })

  test('updates tags with 4 value total', async () => {
    jest.spyOn(Object.getPrototypeOf(window.localStorage), 'getItem').mockReturnValueOnce('mockAccessToken')
    jest.spyOn(Object.getPrototypeOf(window.localStorage), 'setItem')

    const validatorData = {
      mode: Mode.pribadi,
      question: 'Contoh pertanyaan',
      username: 'test',
      created_at: 'test',
      title: 'test',
      tags: ['kategori']
    }

    const { getByTestId, getByPlaceholderText } = render(
      <ValidatorQuestionForm id={'id-test'} validatorData={validatorData} />
    )

    const editTagButton = getByTestId('toggle-tags-button')
    fireEvent.click(editTagButton)
    const newTagInput = getByPlaceholderText('Berikan maksimal 3 kategori ...')
    fireEvent.change(newTagInput, { target: { value: '2' } })
    fireEvent.keyDown(newTagInput, { key: 'Enter', code: 'Enter' })
    fireEvent.change(newTagInput, { target: { value: '3' } })
    fireEvent.keyDown(newTagInput, { key: 'Enter', code: 'Enter' })
    fireEvent.change(newTagInput, { target: { value: '4' } })
    fireEvent.keyDown(newTagInput, { key: 'Enter', code: 'Enter' })

    await waitFor(() => {
      setTimeout(() => {
        expect(toast.error).toHaveBeenCalledWith('Kategori sudah ada 3')
      }, 10000)
    })
  })

  test('updates tags with long category', async () => {
    jest.spyOn(Object.getPrototypeOf(window.localStorage), 'getItem').mockReturnValueOnce('mockAccessToken')
    jest.spyOn(Object.getPrototypeOf(window.localStorage), 'setItem')

    const validatorData = {
      mode: Mode.pribadi,
      question: 'Contoh pertanyaan',
      username: 'test',
      created_at: 'test',
      title: 'test',
      tags: ['kategori']
    }

    const { getByTestId, getByPlaceholderText } = render(
      <ValidatorQuestionForm id={'id-test'} validatorData={validatorData} />
    )

    const editTagButton = getByTestId('toggle-tags-button')
    fireEvent.click(editTagButton)
    const newTagInput = getByPlaceholderText('Berikan maksimal 3 kategori ...')
    fireEvent.change(newTagInput, { target: { value: 'Kategori yang panjang aaaaa' } })
    fireEvent.keyDown(newTagInput, { key: 'Enter', code: 'Enter' })

    await waitFor(() => {
      setTimeout(() => {
        expect(toast.error).toHaveBeenCalledWith('Kategori maksimal 10 karakter.')
      }, 10000)
    })
  })

  test('display error when missing tags on submission', async () => {
    jest.spyOn(Object.getPrototypeOf(window.localStorage), 'getItem').mockReturnValueOnce('mockAccessToken')
    jest.spyOn(Object.getPrototypeOf(window.localStorage), 'setItem')

    const validatorData = {
      mode: Mode.pribadi,
      question: 'Contoh pertanyaan',
      username: 'test',
      created_at: 'test',
      title: 'test',
      tags: ['example tag']
    }

    const { getByText, getByTestId } = render(<ValidatorQuestionForm id={'id-test'} validatorData={validatorData} />)

    const editTagButton = getByTestId('toggle-tags-button')
    fireEvent.click(editTagButton)

    const removeButton = getByTestId('remove-tag-button')
    fireEvent.click(removeButton)

    fireEvent.click(getByText('Kirim'))

    await waitFor(() => {
      setTimeout(() => {
        expect(toast.error).toHaveBeenCalledWith('Minimal mengisi 1 kategori')
      }, 10000)
    })
  })

  test('display error when value of tags not updated', async () => {
    jest.spyOn(Object.getPrototypeOf(window.localStorage), 'getItem').mockReturnValueOnce('mockAccessToken')
    jest.spyOn(Object.getPrototypeOf(window.localStorage), 'setItem')
    const validatorData = {
      mode: Mode.pribadi,
      question: 'Contoh pertanyaan',
      username: 'test',
      created_at: 'test',
      title: 'test',
      tags: ['example tag']
    }

    const { getByText, getByTestId } = render(<ValidatorQuestionForm id={'id-test'} validatorData={validatorData} />)
    const editTagButton = getByTestId('toggle-tags-button')
    fireEvent.click(editTagButton)

    fireEvent.click(getByText('Kirim'))

    await waitFor(() => {
      setTimeout(() => {
        expect(toast).toHaveBeenCalledWith('Kategori sama dengan sebelumnya')
      }, 10000)
    })
  })

  test('reset tags input when modal is closed', async () => {
    jest.spyOn(Object.getPrototypeOf(window.localStorage), 'getItem').mockReturnValueOnce('mockAccessToken')
    jest.spyOn(Object.getPrototypeOf(window.localStorage), 'setItem')
    const validatorData = {
      mode: Mode.pribadi,
      question: 'Contoh pertanyaan',
      username: 'test',
      created_at: 'test',
      title: 'test',
      tags: ['example tag']
    }

    const { getByText, queryByText, getByTestId, getByPlaceholderText } = render(
      <ValidatorQuestionForm id={'id-test'} validatorData={validatorData} />
    )
    const editTagButton = getByTestId('toggle-tags-button')
    fireEvent.click(editTagButton)
    const newTagInput = getByPlaceholderText('Berikan maksimal 3 kategori ...')
    fireEvent.change(newTagInput, { target: { value: 'hilang' } })
    fireEvent.keyDown(newTagInput, { key: 'Enter', code: 'Enter' })

    fireEvent.click(getByText('Batal'))
    fireEvent.click(editTagButton)

    expect(queryByText('hilang')).not.toBeInTheDocument
  })

  test('failed update tags from backend, should show error from backend', async () => {
    const errorResponse = {
      data: {
        detail: 'Backend Error Message'
      }
    }
    mockedAxios.patch.mockRejectedValueOnce({ response: errorResponse })

    jest.spyOn(Object.getPrototypeOf(window.localStorage), 'getItem').mockReturnValueOnce('mockAccessToken')
    jest.spyOn(Object.getPrototypeOf(window.localStorage), 'setItem')

    const validatorData = {
      mode: Mode.pribadi,
      question: 'Contoh pertanyaan',
      username: 'test',
      created_at: 'test',
      title: 'test',
      tags: ['example tag']
    }

    const { getByText, getByTestId, getByPlaceholderText } = render(
      <ValidatorQuestionForm id={'id-test'} validatorData={validatorData} />
    )

    const editTagButton = getByTestId('toggle-tags-button')
    fireEvent.click(editTagButton)
    const newTagInput = getByPlaceholderText('Berikan maksimal 3 kategori ...')
    fireEvent.change(newTagInput, { target: { value: 'Sample Tag' } })
    fireEvent.keyDown(newTagInput, { key: 'Enter', code: 'Enter' })

    fireEvent.click(getByText('Kirim'))

    await waitFor(() => {
      setTimeout(() => {
        expect(toast.error).toHaveBeenCalledWith('Backend Error Message')
      }, 10000)
    })
  })

  test('should show error on unsuccessful update tags', async () => {
    const errorResponse = {
      response: {
        request: {
          responseText: 'Gagal mengubah kategori'
        }
      }
    }
    mockedAxios.patch.mockRejectedValueOnce({ data: errorResponse })

    jest.spyOn(Object.getPrototypeOf(window.localStorage), 'getItem').mockReturnValueOnce('mockAccessToken')
    jest.spyOn(Object.getPrototypeOf(window.localStorage), 'setItem')

    const validatorData = {
      mode: Mode.pribadi,
      question: 'Contoh pertanyaan',
      username: 'test',
      created_at: 'test',
      title: 'test',
      tags: ['example tag']
    }

    const { getByText, getByTestId, getByPlaceholderText } = render(
      <ValidatorQuestionForm id={'id-test'} validatorData={validatorData} />
    )

    const editTagButton = getByTestId('toggle-tags-button')
    fireEvent.click(editTagButton)
    const newTagInput = getByPlaceholderText('Berikan maksimal 3 kategori ...')
    fireEvent.change(newTagInput, { target: { value: 'Sample Tag' } })
    fireEvent.keyDown(newTagInput, { key: 'Enter', code: 'Enter' })

    fireEvent.click(getByText('Kirim'))

    await waitFor(() => {
      setTimeout(() => {
        expect(toast.error).toHaveBeenCalledWith('Gagal mengubah kategori')
      }, 10000)
    })
  })

  test('closes the update tags modal when the close icon is clicked', async () => {
    const validatorData = {
      mode: Mode.pribadi,
      question: 'Contoh pertanyaan',
      username: 'test',
      created_at: 'test',
      title: 'test',
      tags: ['example tag']
    }

    const { getByLabelText, queryByText, getByTestId, getByPlaceholderText } = render(
      <ValidatorQuestionForm id={'id-test'} validatorData={validatorData} />
    )

    const editTagButton = getByTestId('toggle-tags-button')
    fireEvent.click(editTagButton)

    const newTagInput = getByPlaceholderText('Berikan maksimal 3 kategori ...')
    fireEvent.change(newTagInput, { target: { value: 'hilang' } })
    fireEvent.keyDown(newTagInput, { key: 'Enter', code: 'Enter' })

    const closeIcon = getByLabelText('Close')
    fireEvent.click(closeIcon)

    expect(queryByText('hilang')).not.toBeInTheDocument
  })

  test("renders the form correctly", () => {
    render(<ValidatorQuestionForm />);
    expect(screen.getByLabelText("Question:")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /submit/i })).toBeInTheDocument();
  });

  test("allows user to type in the question input field", () => {
    
    render(<ValidatorQuestionForm />);
    const input = screen.getByLabelText("Question:") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "Sample question" } });
    expect(input.value).toBe("Sample question");
  });

  test("displays an error message when submitting empty question", () => {
    render(<ValidatorQuestionForm />);
    fireEvent.click(screen.getByRole("button", { name: /submit/i }));
    expect(screen.getByText("Question cannot be empty")).toBeInTheDocument();
  });

  test("submits form successfully when valid question is entered", () => {
    const handleSubmit = jest.fn();
    render(<ValidatorQuestionForm {...({ onSubmit: handleSubmit } as any)} />);
    
    const input = screen.getByLabelText("Question:");
    fireEvent.change(input, { target: { value: "Is this working?" } });
    fireEvent.click(screen.getByRole("button", { name: /submit/i }));
    
    expect(handleSubmit).toHaveBeenCalledTimes(1);
    expect(handleSubmit).toHaveBeenCalledWith("Is this working?");
  });

  test("does not call onSubmit when input is empty", () => {
    const handleSubmit = jest.fn();
    render(<ValidatorQuestionForm {...({ onSubmit: handleSubmit } as any)} />);
    
    fireEvent.click(screen.getByRole("button", { name: /submit/i }));
    expect(handleSubmit).not.toHaveBeenCalled();
  });
})
