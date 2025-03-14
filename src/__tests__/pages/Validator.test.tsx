import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react'
import QuestionAddPage from '@/pages/validator'
// import axiosInstance from '@/services/axiosInstance'
import { toast } from 'react-hot-toast'
import Mode from '@/constants/mode'
import '@testing-library/jest-dom'

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

describe('QuestionAddPage', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  test('renders correctly with default values', () => {
    const { getByText, getByPlaceholderText } = render(<QuestionAddPage />)
    expect(getByText('Ingin menganalisis masalah apa hari ini?')).toBeInTheDocument()
    expect(getByPlaceholderText('Ingin menganalisis apa hari ini ...')).toBeInTheDocument()
    expect(getByPlaceholderText('Pertanyaan apa yang ingin ditanyakan ...')).toBeInTheDocument()
    expect(getByPlaceholderText('Berikan maksimal 3 kategori ...')).toBeInTheDocument()
  })

  test('updates title, question, and newTag state variables on input change', () => {
    const { getByPlaceholderText } = render(<QuestionAddPage />)
    const titleInput = getByPlaceholderText('Ingin menganalisis apa hari ini ...')
    const questionInput = getByPlaceholderText('Pertanyaan apa yang ingin ditanyakan ...')
    const newTagInput = getByPlaceholderText('Berikan maksimal 3 kategori ...')

    fireEvent.change(titleInput, { target: { value: 'Sample Title' } })
    fireEvent.change(questionInput, { target: { value: 'Sample Question' } })
    fireEvent.change(newTagInput, { target: { value: 'Sample Tag' } })

    expect(titleInput).toHaveValue('Sample Title')
    expect(questionInput).toHaveValue('Sample Question')
    expect(newTagInput).toHaveValue('Sample Tag')
  })

  test('adds a tag when Enter key is pressed', () => {
    const { getByPlaceholderText, getByText } = render(<QuestionAddPage />)
    const newTagInput = getByPlaceholderText('Berikan maksimal 3 kategori ...')

    fireEvent.change(newTagInput, { target: { value: 'Sample Tag' } })
    fireEvent.keyDown(newTagInput, { key: 'Enter', code: 'Enter' })

    expect(getByText('Sample Tag')).toBeInTheDocument()
  })

  test('removes an entered tag when remove button is clicked', () => {
    const { getByPlaceholderText, getByText, getByTestId, queryByText } = render(<QuestionAddPage />)
    const newTagInput = getByPlaceholderText('Berikan maksimal 3 kategori ...')

    fireEvent.change(newTagInput, { target: { value: 'Sample Tag' } })
    fireEvent.keyDown(newTagInput, { key: 'Enter', code: 'Enter' })

    expect(getByText('Sample Tag')).toBeInTheDocument()

    const removeButton = getByTestId('remove-tag-button')
    fireEvent.click(removeButton)

    expect(queryByText('Sample Tag')).not.toBeInTheDocument()
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

  test('changes the mode from PRIBADI to PENGAWASAN', () => {
    const { getByText } = render(<QuestionAddPage />)

    fireEvent.click(getByText(Mode.pribadi))
    fireEvent.click(getByText(Mode.pengawasan))

    expect(getByText(Mode.pengawasan)).toBeInTheDocument
  })

  test('changes the mode from PRIBADI to PENGAWASAN', () => {
    const { getByText } = render(<QuestionAddPage />)

    fireEvent.click(getByText(Mode.pribadi))
    fireEvent.click(getByText(Mode.pengawasan))

    expect(getByText(Mode.pengawasan)).toBeInTheDocument
  })
})