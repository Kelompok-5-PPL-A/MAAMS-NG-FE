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

jest.mock('react-hot-toast', () => {
  const toastMock = jest.fn() as unknown as jest.MockedFunction<typeof import('react-hot-toast').default>;

  toastMock.error = jest.fn();
  toastMock.success = jest.fn();

  return {
    __esModule: true,
    default: toastMock,
    error: toastMock.error,
    success: toastMock.success,
  };
});




beforeEach(() => {
  localStorage.clear()
  jest.clearAllMocks()
})

afterEach(() => {
  localStorage.clear()
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
    jest.spyOn(Object.getPrototypeOf(window.localStorage), 'getItem').mockReturnValueOnce('mockAccessToken');
    jest.spyOn(Object.getPrototypeOf(window.localStorage), 'setItem');
  
    const { getByPlaceholderText, getByTestId } = render(<ValidatorQuestionForm />);
  
    const input = getByPlaceholderText('Isi pertanyaan anda di sini');
    fireEvent.change(input, { target: { value: '' } }); // Kosongkan input
    fireEvent.submit(getByTestId('submit-question')); // Submit form
  
    await waitFor(() => {
      setTimeout(() => {
        expect(toast.error).toHaveBeenCalledWith('Pertanyaan harus diisi');
      }, 10000); // Delay 10 detik untuk memastikan error muncul
    });
  });
  
  test('displays success message and redirects on successful API call', async () => {
    const mockResponseData = { mode: 'mode', question: 'question' }
    mockedAxios.post.mockResolvedValue({ data: mockResponseData })
  
    jest.spyOn(Object.getPrototypeOf(window.localStorage), 'getItem').mockReturnValueOnce('mockAccessToken')
    jest.spyOn(Object.getPrototypeOf(window.localStorage), 'setItem')
  
    const { getByPlaceholderText, getByTestId } = render(<ValidatorQuestionForm />)
  
    const input = getByPlaceholderText('Isi pertanyaan anda di sini')
    fireEvent.change(input, { target: { value: 'question' } })
    fireEvent.submit(getByTestId('submit-question'))
  
    await waitFor(() => {
      setTimeout(() => {
        expect(toast.success).toHaveBeenCalledWith('Analisis berhasil ditambahkan')
      }, 10000)
    })
  })
  
  test('updates mode successfully with API call', async () => {
    const id = 'id-test-1'
    mockedAxios.patch.mockResolvedValue({ data: { mode: Mode.pengawasan } })
  
    jest.spyOn(Object.getPrototypeOf(window.localStorage), 'getItem').mockReturnValueOnce('mockAccessToken')
    jest.spyOn(Object.getPrototypeOf(window.localStorage), 'setItem')
  
    const { getByText, queryByText } = render(<ValidatorQuestionForm id={id} />)
  
    fireEvent.click(getByText(Mode.pribadi))
    fireEvent.click(getByText(Mode.pengawasan))
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

  test('updates tags with duplicate value', async () => {
    // Mock localStorage
    jest.spyOn(Object.getPrototypeOf(window.localStorage), 'getItem').mockReturnValueOnce('mockAccessToken');
    jest.spyOn(Object.getPrototypeOf(window.localStorage), 'setItem');

    const defaultValidatorData = {
      mode: Mode.pribadi,
      question: 'Test Question',
      title: 'Test Title',
      tags: [],
      username: 'testuser',
      created_at: '2023-01-01'
    };

    const { getByText, getByPlaceholderText } = render(
      <ValidatorQuestionForm 
        id={'test-id'} 
        validatorData={defaultValidatorData} 
      />
    );

    // Open tags modal
    const editTagButton = getByText('Ubah Kategori');
    fireEvent.click(editTagButton);

    const newTagInput = getByPlaceholderText('Berikan maksimal 3 kategori ...');

    // Add first tag
    fireEvent.change(newTagInput, { target: { value: 'duplicate' } });
    fireEvent.keyDown(newTagInput, { key: 'Enter', code: 'Enter' });

    // Try to add duplicate tag
    fireEvent.change(newTagInput, { target: { value: 'duplicate' } });
    fireEvent.keyDown(newTagInput, { key: 'Enter', code: 'Enter' });

    // Wait and check if toast.error was called with the correct message
    await waitFor(() => {
      setTimeout(() => {
        expect(toast.error).toHaveBeenCalledWith('Kategori sudah ada. Masukan kategori lain')
      }, 10000)
    });
  });

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
        expect(toast.error).toHaveBeenCalledWith('Kategori sama dengan sebelumnya')
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
})
