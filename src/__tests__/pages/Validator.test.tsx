import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react'
import QuestionAddPage from '@/pages/validator'
// import axiosInstance from '@/services/axiosInstance'
import { toast } from 'react-hot-toast'
import Mode from '@/constants/mode'

const mockPush = jest.fn()
const mockReload = jest.fn()

const routerContext = {
  query: { question: 'Sample Question' }
}

jest.mock('next/router', () => ({
  useRouter: () => ({
    push: mockPush,
    reload: mockReload,
    query: routerContext.query
  })
}))

jest.mock('react-hot-toast', () => ({
  error: jest.fn(),
  success: jest.fn()
}))

describe('QuestionAddPage', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })
  
  test('does not add empty tag when Enter key is pressed with empty input', () => {
    const { getByPlaceholderText, queryByTestId } = render(<QuestionAddPage />)
    const newTagInput = getByPlaceholderText('Berikan maksimal 3 kategori ...')

    fireEvent.change(newTagInput, { target: { value: '' } })
    fireEvent.keyDown(newTagInput, { key: 'Enter', code: 'Enter' })

    expect(queryByTestId('remove-tag-button')).not.toBeInTheDocument()
  })

  test('does not add tag with only whitespace when Enter key is pressed', () => {
    const { getByPlaceholderText, queryByTestId } = render(<QuestionAddPage />)
    const newTagInput = getByPlaceholderText('Berikan maksimal 3 kategori ...')

    fireEvent.change(newTagInput, { target: { value: '   ' } })
    fireEvent.keyDown(newTagInput, { key: 'Enter', code: 'Enter' })

    expect(queryByTestId('remove-tag-button')).not.toBeInTheDocument()
  })

  test('trims whitespace from tags when adding', () => {
    const { getByPlaceholderText, getByText } = render(<QuestionAddPage />)
    const newTagInput = getByPlaceholderText('Berikan maksimal 3 kategori ...')

    fireEvent.change(newTagInput, { target: { value: '  Tag1  ' } })
    fireEvent.keyDown(newTagInput, { key: 'Enter', code: 'Enter' })

    expect(getByText('Tag1')).toBeInTheDocument()
  })

  test('clears input field after adding tag', () => {
    const { getByPlaceholderText } = render(<QuestionAddPage />)
    const newTagInput = getByPlaceholderText('Berikan maksimal 3 kategori ...')

    fireEvent.change(newTagInput, { target: { value: 'Tag1' } })
    fireEvent.keyDown(newTagInput, { key: 'Enter', code: 'Enter' })

    expect(newTagInput.getAttribute('value')).toBe('')
  })
  
  test('ignores non-Enter key presses for tag input', () => {
    const { getByPlaceholderText, queryByText } = render(<QuestionAddPage />)
    const newTagInput = getByPlaceholderText('Berikan maksimal 3 kategori ...')

    fireEvent.change(newTagInput, { target: { value: 'Tag1' } })
    fireEvent.keyDown(newTagInput, { key: 'Space', code: 'Space' })

    expect(queryByText('Tag1')).not.toBeInTheDocument()
    expect(newTagInput.getAttribute('value')).toBe('Tag1')
  })
  
  test('handles Enter key press without any input value', () => {
    const { getByPlaceholderText, queryByTestId } = render(<QuestionAddPage />)
    const newTagInput = getByPlaceholderText('Berikan maksimal 3 kategori ...')
    
    fireEvent.keyDown(newTagInput, { key: 'Enter', code: 'Enter' })
    
    expect(queryByTestId('remove-tag-button')).not.toBeInTheDocument()
  })
  })

  test('renders correctly with default values', () => {
    const { getByText, getByPlaceholderText } = render(<QuestionAddPage />)
    expect(getByText('Ingin menganalisis masalah apa hari ini?')).toBeInTheDocument
    expect(getByPlaceholderText('Ingin menganalisis apa hari ini ...')).toBeInTheDocument
    expect(getByPlaceholderText('Pertanyaan apa yang ingin ditanyakan ...')).toBeInTheDocument
    expect(getByPlaceholderText('Berikan maksimal 3 kategori ...')).toBeInTheDocument
  })

  test('updates title, question, and newTag state variables on input change', () => {
    const { getByPlaceholderText } = render(<QuestionAddPage />)
    const titleInput = getByPlaceholderText('Ingin menganalisis apa hari ini ...')
    const questionInput = getByPlaceholderText('Pertanyaan apa yang ingin ditanyakan ...')
    const newTagInput = getByPlaceholderText('Berikan maksimal 3 kategori ...')

    fireEvent.change(titleInput, { target: { value: 'Sample Title' } })
    fireEvent.change(questionInput, { target: { value: 'Sample Question' } })
    fireEvent.change(newTagInput, { target: { value: 'Sample Tag' } })

    expect(titleInput.getAttribute('value')).toBe('Sample Title')
    expect(questionInput.getAttribute('value')).toBe('Sample Question')
    expect(newTagInput.getAttribute('value')).toBe('Sample Tag')
  })

  test('adds a tag when Enter key is pressed', () => {
    const { getByPlaceholderText, getByText } = render(<QuestionAddPage />)
    const newTagInput = getByPlaceholderText('Berikan maksimal 3 kategori ...')

    fireEvent.change(newTagInput, { target: { value: 'Sample Tag' } })
    fireEvent.keyDown(newTagInput, { key: 'Enter', code: 'Enter' })

    expect(getByText('Sample Tag')).toBeInTheDocument
  })

  test('removes an entered tag when remove button is clicked', () => {
    const { getByPlaceholderText, getByText, getByTestId, queryByText } = render(<QuestionAddPage />)
    const newTagInput = getByPlaceholderText('Berikan maksimal 3 kategori ...')

    fireEvent.change(newTagInput, { target: { value: 'Sample Tag' } })
    fireEvent.keyDown(newTagInput, { key: 'Enter', code: 'Enter' })

    expect(getByText('Sample Tag')).toBeInTheDocument

    const removeButton = getByTestId('remove-tag-button')
    fireEvent.click(removeButton)

    expect(queryByText('Sample Tag')).not.toBeInTheDocument
  })

  test('prevents adding more than 3 tags', async () => {
    const { getByPlaceholderText } = render(<QuestionAddPage />)
    const newTagInput = getByPlaceholderText('Berikan maksimal 3 kategori ...')

    for (let i = 0; i < 4; i++) {
      fireEvent.change(newTagInput, { target: { value: `Tag ${i + 1}` } })
      fireEvent.keyDown(newTagInput, { key: 'Enter', code: 'Enter' })
    }

    await waitFor(() => {
      setTimeout(() => {
        expect(toast.error).toHaveBeenCalledWith('Kategori sudah ada 3')
      }, 10000)
    })
  })

  test('displays error messages for missing title on form submission', async () => {
    const { getByText } = render(<QuestionAddPage />)
    const submitButton = getByText('Kirim')
    fireEvent.click(submitButton)

    await waitFor(() => {
      setTimeout(() => {
        expect(toast.error).toHaveBeenCalledWith('Judul harus diisi')
      }, 10000)
    })
  })

  test('displays error messages for too long title on submission', async () => {
    const { getByText, getByPlaceholderText } = render(<QuestionAddPage />)
    const titleInput = getByPlaceholderText('Ingin menganalisis apa hari ini ...')
    const questionInput = getByPlaceholderText('Pertanyaan apa yang ingin ditanyakan ...')
    const newTagInput = getByPlaceholderText('Berikan maksimal 3 kategori ...')

    const submitButton = getByText('Kirim')

    fireEvent.change(titleInput, {
      target: {
        value: 'Longggggggggggggggggggggggggg Titleeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
      }
    })
    fireEvent.change(questionInput, { target: { value: 'Sample Question' } })
    fireEvent.change(newTagInput, { target: { value: 'Sample Tag' } })
    fireEvent.keyDown(newTagInput, { key: 'Enter', code: 'Enter' })
    fireEvent.click(submitButton)

    await waitFor(() => {
      setTimeout(() => {
        expect(toast.error).toHaveBeenCalledWith('Judul maksimal 40 karakter. Berikan judul yang lebih singkat')
      }, 10000)
    })
  })

  test('displays error messages for missing question on form submission', async () => {
    const { getByText, getByPlaceholderText } = render(<QuestionAddPage />)
    const titleInput = getByPlaceholderText('Ingin menganalisis apa hari ini ...')
    const submitButton = getByText('Kirim')

    fireEvent.change(titleInput, { target: { value: 'Sample Title' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      setTimeout(() => {
        expect(toast.error).toHaveBeenCalledWith('Pertanyaan harus diisi')
      }, 10000)
    })
  })

  test('displays error messages for missing tags on form submission', async () => {
    const { getByText, getByPlaceholderText } = render(<QuestionAddPage />)
    const titleInput = getByPlaceholderText('Ingin menganalisis apa hari ini ...')
    const questionInput = getByPlaceholderText('Pertanyaan apa yang ingin ditanyakan ...')
    const submitButton = getByText('Kirim')

    fireEvent.change(titleInput, { target: { value: 'Sample Title' } })
    fireEvent.change(questionInput, { target: { value: 'Sample Question' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      setTimeout(() => {
        expect(toast.error).toHaveBeenCalledWith('Minimal mengisi 1 kategori')
      }, 10000)
    })
  })

  // test('submits form with valid data and redirects to correct route', async () => {
  //   const mockPost = jest.fn().mockResolvedValueOnce({ data: { id: 123 } })
  //   const { getByText, getByPlaceholderText } = render(<QuestionAddPage />)
  //   axiosInstance.post = mockPost

  //   const titleInput = getByPlaceholderText('Ingin menganalisis apa hari ini ...')
  //   const questionInput = getByPlaceholderText('Pertanyaan apa yang ingin ditanyakan ...')
  //   const newTagInput = getByPlaceholderText('Berikan maksimal 3 kategori ...')
  //   const submitButton = getByText('Kirim')

  //   fireEvent.change(titleInput, { target: { value: 'Sample Title' } })
  //   fireEvent.change(questionInput, { target: { value: 'Sample Question' } })
  //   fireEvent.change(newTagInput, { target: { value: 'Sample Tag' } })
  //   fireEvent.keyDown(newTagInput, { key: 'Enter', code: 'Enter' })

  //   fireEvent.click(submitButton)

  //   await waitFor(() => expect(axiosInstance.post).toHaveBeenCalledTimes(1))
  //   expect(axiosInstance.post).toHaveBeenCalledWith('/api/v1/validator/baru/', {
  //     title: 'Sample Title',
  //     question: 'Sample Question',
  //     mode: 'PRIBADI',
  //     tags: ['Sample Tag']
  //   })
  //   expect(mockPost).toHaveBeenCalled()
  //   await waitFor(() => {
  //     setTimeout(() => {
  //       expect(toast.error).toHaveBeenCalledWith('Analisis berhasil ditambahkan')
  //     }, 10000)
  //   })
  // })

  test('submits form with a long category', async () => {
    const { getByPlaceholderText } = render(<QuestionAddPage />)
    const newTagInput = getByPlaceholderText('Berikan maksimal 3 kategori ...')

    fireEvent.change(newTagInput, { target: { value: 'Kategori yang panjang' } })
    fireEvent.keyDown(newTagInput, { key: 'Enter', code: 'Enter' })

    await waitFor(() => {
      setTimeout(() => {
        expect(toast.error).toHaveBeenCalledWith('Kategori maksimal 10 karakter.')
      }, 10000)
    })
  })

  test('submits form with duplicate category', async () => {
    const { getByPlaceholderText } = render(<QuestionAddPage />)
    const newTagInput = getByPlaceholderText('Berikan maksimal 3 kategori ...')

    fireEvent.change(newTagInput, { target: { value: 'Kategori' } })
    fireEvent.keyDown(newTagInput, { key: 'Enter', code: 'Enter' })
    fireEvent.change(newTagInput, { target: { value: 'Kategori' } })
    fireEvent.keyDown(newTagInput, { key: 'Enter', code: 'Enter' })

    await waitFor(() => {
      setTimeout(() => {
        expect(toast.error).toHaveBeenCalledWith('Kategori sudah ada. Masukan kategori lain')
      }, 10000)
    })
  })

  test('changes the mode from PRIBADI to PENGAWASAN', () => {
    const { getByText } = render(<QuestionAddPage />)

    fireEvent.click(getByText(Mode.pribadi))
    fireEvent.click(getByText(Mode.pengawasan))

    expect(getByText(Mode.pengawasan)).toBeInTheDocument
  })

  // test('displays error message from backend when fail to post', async () => {
  //   const errorResponse = {
  //     data: {
  //       detail: 'Backend Error Message'
  //     }
  //   }
  //   const mockPost = jest.fn().mockRejectedValueOnce({ response: errorResponse })
  //   axiosInstance.post = mockPost

  //   const { getByText, getByPlaceholderText } = render(<QuestionAddPage />)

  //   const titleInput = getByPlaceholderText('Ingin menganalisis apa hari ini ...')
  //   const questionInput = getByPlaceholderText('Pertanyaan apa yang ingin ditanyakan ...')
  //   const newTagInput = getByPlaceholderText('Berikan maksimal 3 kategori ...')
  //   const submitButton = getByText('Kirim')

  //   fireEvent.change(titleInput, { target: { value: 'Sample Title' } })
  //   fireEvent.change(questionInput, { target: { value: 'Sample Question' } })
  //   fireEvent.change(newTagInput, { target: { value: 'Sample Tag' } })
  //   fireEvent.keyDown(newTagInput, { key: 'Enter', code: 'Enter' })

  //   fireEvent.click(submitButton)

  //   await waitFor(() => {
  //     setTimeout(() => {
  //       expect(toast).toHaveBeenCalledWith('Backend Error Message')
  //     }, 10000)
  //   })
  // })

  // test('displays error message from backend when fail to post', async () => {
  //   const mockPost = jest.fn().mockRejectedValueOnce({ status: 400 })
  //   axiosInstance.post = mockPost

  //   const { getByText, getByPlaceholderText } = render(<QuestionAddPage />)

  //   const titleInput = getByPlaceholderText('Ingin menganalisis apa hari ini ...')
  //   const questionInput = getByPlaceholderText('Pertanyaan apa yang ingin ditanyakan ...')
  //   const newTagInput = getByPlaceholderText('Berikan maksimal 3 kategori ...')
  //   const submitButton = getByText('Kirim')

  //   fireEvent.change(titleInput, { target: { value: 'Sample Title' } })
  //   fireEvent.change(questionInput, { target: { value: 'Sample Question' } })
  //   fireEvent.change(newTagInput, { target: { value: 'Sample Tag' } })
  //   fireEvent.keyDown(newTagInput, { key: 'Enter', code: 'Enter' })

  //   fireEvent.click(submitButton)

  //   await waitFor(() => {
  //     setTimeout(() => {
  //       expect(toast).toHaveBeenCalledWith('Gagal menambahkan analisis')
  //     }, 10000)
  //   })
  // })

  test('should set question state when router query parameter is present', async () => {
    const { getByPlaceholderText } = render(<QuestionAddPage />)

    await waitFor(() => {
      const questionInput = getByPlaceholderText('Pertanyaan apa yang ingin ditanyakan ...') as HTMLInputElement
      expect(questionInput.value).toBe('Sample Question')
    })
  })

  test('should reset question if input is deleted', async () => {
    const { getByText, getByPlaceholderText } = render(<QuestionAddPage />)

    await waitFor(() => {
      const questionInput = getByPlaceholderText('Pertanyaan apa yang ingin ditanyakan ...') as HTMLInputElement
      expect(questionInput.value).toBe('Sample Question')
    })

    const titleInput = getByPlaceholderText('Ingin menganalisis apa hari ini ...')
    const questionInput = getByPlaceholderText('Pertanyaan apa yang ingin ditanyakan ...')
    const newTagInput = getByPlaceholderText('Berikan maksimal 3 kategori ...')
    const submitButton = getByText('Kirim')

    fireEvent.change(titleInput, { target: { value: 'Sample Title' } })
    fireEvent.change(questionInput, { target: { value: '' } })
    fireEvent.change(newTagInput, { target: { value: 'Sample Tag' } })
    fireEvent.keyDown(newTagInput, { key: 'Enter', code: 'Enter' })

    fireEvent.click(submitButton)

    await waitFor(() => {
      setTimeout(() => {
        expect(toast.error).toHaveBeenCalledWith('Pertanyaan harus diisi')
      }, 10000)
    })
  })