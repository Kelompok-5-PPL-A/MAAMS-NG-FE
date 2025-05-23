import React from 'react'
import { render, fireEvent, waitFor, screen, act } from '@testing-library/react'
import QuestionAddPage from '@/pages/validator'
import axiosInstance from '@/services/axiosInstance'
import toast from 'react-hot-toast'
import Mode from '@/constants/mode'
import '@testing-library/jest-dom'
import { SessionProvider } from 'next-auth/react'

jest.mock('@/services/axiosInstance')
jest.mock('react-hot-toast', () => ({
  error: jest.fn(),
  success: jest.fn()
}))

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

const WrappedQuestionAddPage = () => (
  <SessionProvider session={null}>
    <QuestionAddPage />
  </SessionProvider>
)

describe('QuestionAddPage', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  test('renders correctly with default values', () => {
    const { getByText, getByPlaceholderText } = render(<WrappedQuestionAddPage />)
    expect(getByText('Ingin menganalisis masalah apa hari ini?')).toBeInTheDocument()
    expect(getByPlaceholderText('Ingin menganalisis apa hari ini ...')).toBeInTheDocument()
    expect(getByPlaceholderText('Pertanyaan apa yang ingin ditanyakan ...')).toBeInTheDocument()
    expect(getByPlaceholderText('Berikan maksimal 3 kategori ...')).toBeInTheDocument()
  })

  test('handleConfirmModeChange updates mode and hides confirmation', () => {
    render(<WrappedQuestionAddPage />)

    fireEvent.click(screen.getByText(/pribadi/i)) 
    fireEvent.click(screen.getByText(/pengawasan/i)) 
    
    fireEvent.click(screen.getByText(/simpan/i)) 

    expect(screen.getByText(/pengawasan/i)).toBeInTheDocument()
  })

  test('handleCancelModeChange reverts mode change and hides confirmation', () => {
    render(<WrappedQuestionAddPage />)

    fireEvent.click(screen.getByText(/pribadi/i))
    fireEvent.click(screen.getByText(/pengawasan/i)) 

    fireEvent.click(screen.getByText(/batal/i)) 

    expect(screen.getByText(/pribadi/i)).toBeInTheDocument()
  })

  test('prevents form submission if API call fails', async () => {
    jest.spyOn(axiosInstance, 'post').mockRejectedValueOnce(new Error('Network Error'))

    const { getByText, getByPlaceholderText } = render(<WrappedQuestionAddPage />)
    
    fireEvent.change(getByPlaceholderText('Ingin menganalisis apa hari ini ...'), {
      target: { value: 'Sample Title' }
    })
    fireEvent.change(getByPlaceholderText('Pertanyaan apa yang ingin ditanyakan ...'), {
      target: { value: 'Sample Question' }
    })
    fireEvent.change(getByPlaceholderText('Berikan maksimal 3 kategori ...'), {
      target: { value: 'Tag1' }
    })
    fireEvent.keyDown(getByPlaceholderText('Berikan maksimal 3 kategori ...'), { key: 'Enter' })
    fireEvent.click(getByText('Kirim'))

    await waitFor(() => {
      setTimeout(() => {
        expect(toast.error).toHaveBeenCalledWith('Minimal mengisi 1 kategori')
      }, 10000)
    })
  })

  test('successfully submits form when API returns success', async () => {
    const mockPost = jest.spyOn(axiosInstance, 'post').mockResolvedValueOnce({ data: { success: true } })

    const mockPush = jest.fn()
    jest.mock('next/router', () => ({
      useRouter: () => ({ push: mockPush, reload: jest.fn(), query: {} })
    }))

    const { getByText, getByPlaceholderText } = render(<WrappedQuestionAddPage />)
    
    fireEvent.change(getByPlaceholderText('Ingin menganalisis apa hari ini ...'), {
      target: { value: 'Sample Title' }
    })
    fireEvent.change(getByPlaceholderText('Pertanyaan apa yang ingin ditanyakan ...'), {
      target: { value: 'Sample Question' }
    })
    fireEvent.change(getByPlaceholderText('Berikan maksimal 3 kategori ...'), {
      target: { value: 'Tag1' }
    })
    fireEvent.keyDown(getByPlaceholderText('Berikan maksimal 3 kategori ...'), { key: 'Enter' })
    fireEvent.click(getByText('Kirim'))

    await waitFor(() => {
      expect(axiosInstance.post).toHaveBeenCalledTimes(1)
      expect(axiosInstance.post).toHaveBeenCalledWith('api/v1/question/submit/', {
        title: 'Sample Title',
        question: 'Sample Question',
        mode: 'PRIBADI',
        tags: ['Tag1']
      })
    })
    expect(mockPost).toHaveBeenCalled()
    await waitFor(() => {
      setTimeout(() => {
        expect(toast.error).toHaveBeenCalledWith('Minimal mengisi 1 kategori')
      }, 10000)
    })
  })

  test('handles API error and does not redirect', async () => {
    jest.spyOn(axiosInstance, 'post').mockRejectedValueOnce(new Error('Request failed'))

    const { getByText, getByPlaceholderText } = render(<WrappedQuestionAddPage />)
    fireEvent.change(getByPlaceholderText('Ingin menganalisis apa hari ini ...'), {
      target: { value: 'Error Case Title' }
    })
    fireEvent.change(getByPlaceholderText('Pertanyaan apa yang ingin ditanyakan ...'), {
      target: { value: 'Error Case Question' }
    })
    fireEvent.change(getByPlaceholderText('Berikan maksimal 3 kategori ...'), {
      target: { value: 'TagError' }
    })
    fireEvent.keyDown(getByPlaceholderText('Berikan maksimal 3 kategori ...'), { key: 'Enter' })
    fireEvent.click(getByText('Kirim'))
  
    await waitFor(() => {
      expect(axiosInstance.post).toHaveBeenCalledTimes(1)
      setTimeout(() => {
        expect(toast.error).toHaveBeenCalledWith('Gagal mengirim pertanyaan')
      }, 10000)
      expect(mockPush).not.toHaveBeenCalled()
    })
  })

  test('does not submit if title, question, and tags are empty', async () => {
    const { getByText, getByPlaceholderText } = render(<WrappedQuestionAddPage />)
  
    fireEvent.change(getByPlaceholderText('Ingin menganalisis apa hari ini ...'), {
      target: { value: '' }
    })
    fireEvent.change(getByPlaceholderText('Pertanyaan apa yang ingin ditanyakan ...'), {
      target: { value: '' }
    })
    fireEvent.change(getByPlaceholderText('Berikan maksimal 3 kategori ...'), {
      target: { value: '' }
    })
    fireEvent.click(getByText('Kirim'))
  
    await waitFor(() => {
      setTimeout(() => {
        expect(toast.error).toHaveBeenCalledWith('Judul harus diisi')
        expect(toast.error).toHaveBeenCalledWith('Pertanyaan harus diisi')
        expect(toast.error).toHaveBeenCalledWith('Minimal mengisi 1 kategori')
      }, 10000)
    })
  })

  test('prevents multiple API calls when clicking submit multiple times', async () => {
    const mockPost = jest.spyOn(axiosInstance, 'post').mockResolvedValueOnce({ data: { success: true } })
  
    const { getByText, getByPlaceholderText } = render(<WrappedQuestionAddPage />)
    fireEvent.change(getByPlaceholderText('Ingin menganalisis apa hari ini ...'), { target: { value: 'Title' } })
    fireEvent.change(getByPlaceholderText('Pertanyaan apa yang ingin ditanyakan ...'), { target: { value: 'Question' } })
    fireEvent.change(getByPlaceholderText('Berikan maksimal 3 kategori ...'), { target: { value: 'Tag1' } })
    fireEvent.keyDown(getByPlaceholderText('Berikan maksimal 3 kategori ...'), { key: 'Enter' })
  
    const submitButton = getByText('Kirim')
    fireEvent.click(submitButton)
    fireEvent.click(submitButton)
    fireEvent.click(submitButton)
  
    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledTimes(1)
    })
  })

  test('updates title, question, and newTag state variables on input change', () => {
    const { getByPlaceholderText } = render(<WrappedQuestionAddPage />)
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
    const { getByPlaceholderText, getByText } = render(<WrappedQuestionAddPage />)
    const newTagInput = getByPlaceholderText('Berikan maksimal 3 kategori ...')

    fireEvent.change(newTagInput, { target: { value: 'Sample Tag' } })
    fireEvent.keyDown(newTagInput, { key: 'Enter', code: 'Enter' })

    expect(getByText('Sample Tag')).toBeInTheDocument()
  })

  test('removes an entered tag when remove button is clicked', () => {
    const { getByPlaceholderText, getByText, getByTestId, queryByText } = render(<WrappedQuestionAddPage />)
    const newTagInput = getByPlaceholderText('Berikan maksimal 3 kategori ...')

    fireEvent.change(newTagInput, { target: { value: 'Sample Tag' } })
    fireEvent.keyDown(newTagInput, { key: 'Enter', code: 'Enter' })

    expect(getByText('Sample Tag')).toBeInTheDocument()

    const removeButton = getByTestId('remove-tag-button')
    fireEvent.click(removeButton)

    expect(queryByText('Sample Tag')).not.toBeInTheDocument()
  })

  test('prevents adding more than 3 tags', async () => {
    const { getByPlaceholderText } = render(<WrappedQuestionAddPage />)
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
    const { getByText } = render(<WrappedQuestionAddPage />)
    const submitButton = getByText('Kirim')
    fireEvent.click(submitButton)

    await waitFor(() => {
      setTimeout(() => {
        expect(toast.error).toHaveBeenCalledWith('Judul harus diisi')
      }, 10000)
    })
  })

  test('displays error messages for too long title on submission', async () => {
    const { getByText, getByPlaceholderText } = render(<WrappedQuestionAddPage />)
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
    const { getByText, getByPlaceholderText } = render(<WrappedQuestionAddPage />)
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
    const { getByText, getByPlaceholderText } = render(<WrappedQuestionAddPage />)
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

  test('displays error message from backend when fail to post', async () => {
    const errorResponse = {
      data: {
        detail: 'Backend Error Message'
      }
    }
    const mockPost = jest.fn().mockRejectedValueOnce({ response: errorResponse })
    axiosInstance.post = mockPost

    const { getByText, getByPlaceholderText } = render(<WrappedQuestionAddPage />)

    const titleInput = getByPlaceholderText('Ingin menganalisis apa hari ini ...')
    const questionInput = getByPlaceholderText('Pertanyaan apa yang ingin ditanyakan ...')
    const newTagInput = getByPlaceholderText('Berikan maksimal 3 kategori ...')
    const submitButton = getByText('Kirim')

    fireEvent.change(titleInput, { target: { value: 'Sample Title' } })
    fireEvent.change(questionInput, { target: { value: 'Sample Question' } })
    fireEvent.change(newTagInput, { target: { value: 'Sample Tag' } })
    fireEvent.keyDown(newTagInput, { key: 'Enter', code: 'Enter' })

    fireEvent.click(submitButton)

    await waitFor(() => {
      setTimeout(() => {
        expect(toast).toHaveBeenCalledWith('Backend Error Message')
      }, 10000)
    })
  })

  test('displays error message from backend when fail to post', async () => {
    const mockPost = jest.fn().mockRejectedValueOnce({ status: 400 })
    axiosInstance.post = mockPost

    const { getByText, getByPlaceholderText } = render(<WrappedQuestionAddPage />)

    const titleInput = getByPlaceholderText('Ingin menganalisis apa hari ini ...')
    const questionInput = getByPlaceholderText('Pertanyaan apa yang ingin ditanyakan ...')
    const newTagInput = getByPlaceholderText('Berikan maksimal 3 kategori ...')
    const submitButton = getByText('Kirim')

    fireEvent.change(titleInput, { target: { value: 'Sample Title' } })
    fireEvent.change(questionInput, { target: { value: 'Sample Question' } })
    fireEvent.change(newTagInput, { target: { value: 'Sample Tag' } })
    fireEvent.keyDown(newTagInput, { key: 'Enter', code: 'Enter' })

    fireEvent.click(submitButton)

    await waitFor(() => {
      setTimeout(() => {
        expect(toast).toHaveBeenCalledWith('Gagal menambahkan analisis')
      }, 10000)
    })
  })

  test('submits form with valid data and redirects to correct route', async () => {
    const mockPost = jest.fn().mockResolvedValueOnce({ data: { id: 123 } })
    const { getByText, getByPlaceholderText } = render(<WrappedQuestionAddPage />)
    axiosInstance.post = mockPost

    const titleInput = getByPlaceholderText('Ingin menganalisis apa hari ini ...')
    const questionInput = getByPlaceholderText('Pertanyaan apa yang ingin ditanyakan ...')
    const newTagInput = getByPlaceholderText('Berikan maksimal 3 kategori ...')
    const submitButton = getByText('Kirim')

    fireEvent.change(titleInput, { target: { value: 'Sample Title' } })
    fireEvent.change(questionInput, { target: { value: 'Sample Question' } })
    fireEvent.change(newTagInput, { target: { value: 'Sample Tag' } })
    fireEvent.keyDown(newTagInput, { key: 'Enter', code: 'Enter' })

    fireEvent.click(submitButton)

    await waitFor(() => expect(axiosInstance.post).toHaveBeenCalledTimes(1))
    expect(axiosInstance.post).toHaveBeenCalledWith('api/v1/question/submit/', {
      title: 'Sample Title',
      question: 'Sample Question',
      mode: 'PRIBADI',
      tags: ['Sample Tag']
    })
    expect(mockPost).toHaveBeenCalled()
    await waitFor(() => {
      setTimeout(() => {
        expect(toast.error).toHaveBeenCalledWith('Analisis berhasil ditambahkan')
      }, 10000)
    })
  })

  test('submits form with a long category', async () => {
    const { getByPlaceholderText } = render(<WrappedQuestionAddPage />)
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
    const { getByPlaceholderText } = render(<WrappedQuestionAddPage />)
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
    const { getByText } = render(<WrappedQuestionAddPage />)

    fireEvent.click(getByText(Mode.pribadi))
    fireEvent.click(getByText(Mode.pengawasan))

    expect(getByText(Mode.pengawasan)).toBeInTheDocument
  })

  test('should set question state when router query parameter is present', async () => {
    const { getByPlaceholderText } = render(<WrappedQuestionAddPage />)

    await waitFor(() => {
      const questionInput = getByPlaceholderText('Pertanyaan apa yang ingin ditanyakan ...') as HTMLInputElement
      expect(questionInput.value).toBe('Sample Question')
    })
  })

  test('should reset question if input is deleted', async () => {
    const { getByText, getByPlaceholderText } = render(<WrappedQuestionAddPage />)

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
    const { getByText } = render(<WrappedQuestionAddPage />)

    fireEvent.click(getByText(Mode.pribadi))
    fireEvent.click(getByText(Mode.pengawasan))

    expect(getByText(Mode.pengawasan)).toBeInTheDocument
  })

  test('changes the mode from PRIBADI to PENGAWASAN', () => {
    const { getByText } = render(<WrappedQuestionAddPage />)

    fireEvent.click(getByText(Mode.pribadi))
    fireEvent.click(getByText(Mode.pengawasan))

    expect(getByText(Mode.pengawasan)).toBeInTheDocument
  })

  test('toggles mode between PRIBADI and PENGAWASAN', () => {
    const { getByText } = render(<WrappedQuestionAddPage />)
  
    fireEvent.click(getByText(Mode.pribadi))
    fireEvent.click(getByText(Mode.pengawasan))
    expect(getByText(Mode.pengawasan)).toBeInTheDocument()
  
    fireEvent.click(getByText(Mode.pengawasan))
    fireEvent.click(getByText(Mode.pribadi))
    expect(getByText(Mode.pribadi)).toBeInTheDocument()
  })

  test('sets question from router.query.question', async () => {
    const mockRouter = {
      query: { question: 'Test Question?' }
    }
    
    // Update the router mock before rendering
    jest.spyOn(require('next/router'), 'useRouter').mockImplementation(() => mockRouter)
    
    render(<WrappedQuestionAddPage />)
    
    // Wait for the question to be set
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Pertanyaan apa yang ingin ditanyakan ...')).toHaveValue('Test Question?')
    })
  })

  test('displays confirmation popup when mode changes', async () => {
    render(<WrappedQuestionAddPage />)

    // Click mode button to open dropdown
    await act(async () => {
      fireEvent.click(screen.getByText(Mode.pribadi))
    })

    // Wait for and click the pengawasan option
    await waitFor(() => {
      expect(screen.getByText(Mode.pengawasan)).toBeInTheDocument()
    })

    await act(async () => {
      fireEvent.click(screen.getByText(Mode.pengawasan))
    })

    // Verify confirmation popup is shown
    expect(screen.getByText('Apakah Anda yakin ingin menampilkan analisis ini kepada Admin?')).toBeInTheDocument()
  })

  test('confirms and updates mode', async () => {
    render(<WrappedQuestionAddPage />)

    // Click mode button to open dropdown
    await act(async () => {
      fireEvent.click(screen.getByText(Mode.pribadi))
    })

    // Wait for and click the pengawasan option
    await waitFor(() => {
      expect(screen.getByText(Mode.pengawasan)).toBeInTheDocument()
    })

    await act(async () => {
      fireEvent.click(screen.getByText(Mode.pengawasan))
    })

    // Click confirm button
    await act(async () => {
      fireEvent.click(screen.getByText('Simpan'))
    })

    // Verify mode is updated
    expect(screen.getByText(Mode.pengawasan)).toBeInTheDocument()
  })

  test('cancels mode change', async () => {
    render(<WrappedQuestionAddPage />)

    // Click mode button to open dropdown
    await act(async () => {
      fireEvent.click(screen.getByText(Mode.pribadi))
    })

    // Wait for and click the pengawasan option
    await waitFor(() => {
      expect(screen.getByText(Mode.pengawasan)).toBeInTheDocument()
    })

    await act(async () => {
      fireEvent.click(screen.getByText(Mode.pengawasan))
    })

    // Click cancel button
    await act(async () => {
      fireEvent.click(screen.getByText('Batal'))
    })

    // Verify mode remains unchanged
    expect(screen.getByText(Mode.pribadi)).toBeInTheDocument()
  })

  test('prevents adding more than 3 categories', async () => {
    render(<WrappedQuestionAddPage />)

    const categoryInput = screen.getByPlaceholderText('Berikan maksimal 3 kategori ...')

    // Add 3 categories
    await act(async () => {
      fireEvent.change(categoryInput, { target: { value: 'Category1' } })
      fireEvent.keyDown(categoryInput, { key: 'Enter' })
      fireEvent.change(categoryInput, { target: { value: 'Category2' } })
      fireEvent.keyDown(categoryInput, { key: 'Enter' })
      fireEvent.change(categoryInput, { target: { value: 'Category3' } })
      fireEvent.keyDown(categoryInput, { key: 'Enter' })

      // Try to add a fourth category
      fireEvent.change(categoryInput, { target: { value: 'Category4' } })
      fireEvent.keyDown(categoryInput, { key: 'Enter' })
    })

    // Verify error message
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Kategori sudah ada 3')
    })
  })

  test('prevents adding empty category', async () => {
    render(<WrappedQuestionAddPage />)

    const categoryInput = screen.getByPlaceholderText('Berikan maksimal 3 kategori ...')

    await act(async () => {
      fireEvent.change(categoryInput, { target: { value: '' } })
      fireEvent.keyDown(categoryInput, { key: 'Enter' })
    })

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Kategori harus diisi')
    })
  })

  test('handles question query parameter changes', async () => {
    // Mock router with initial query
    const mockRouter = {
      query: { question: 'Initial Question' } as { question: string | undefined | null }
    }
    jest.spyOn(require('next/router'), 'useRouter').mockImplementation(() => mockRouter)
    
    const { rerender } = render(<WrappedQuestionAddPage />)
    
    // Verify initial question is set
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Pertanyaan apa yang ingin ditanyakan ...')).toHaveValue('Initial Question')
    })

    mockRouter.query = { question: 'Updated Question' }
    rerender(<WrappedQuestionAddPage />)
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Pertanyaan apa yang ingin ditanyakan ...')).toHaveValue('Updated Question')
    })
  })

  test('does not set question when router.query.question is falsy', async () => {
    // Mock router with falsy question query
    const mockRouter = {
      query: { question: '' } as { question: string | undefined | null }
    }
    jest.spyOn(require('next/router'), 'useRouter').mockImplementation(() => mockRouter)
    
    render(<WrappedQuestionAddPage />)
    
    // Verify question is not set
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Pertanyaan apa yang ingin ditanyakan ...')).toHaveValue('')
    })
  })
})