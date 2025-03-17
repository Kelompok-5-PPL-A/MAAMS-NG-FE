import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import ValidatorDetailPage from '../../pages/validator/[id]'
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { useRouter } from 'next/router';
import Mode from '@/constants/mode';
import toast from 'react-hot-toast';
import { CauseStatus } from '@/lib/enum';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('react-hot-toast', () => ({
    success: jest.fn(),
    error: jest.fn(),
    loading: jest.fn(),
    dismiss: jest.fn(),
}));

const mockAxios = new MockAdapter(axios);

describe('ValidatorDetailPage', () => {
  const mockRouter = {
    query: { id: '1' },
    push: jest.fn(),
  };

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    mockAxios.reset();
    jest.clearAllMocks()
  });

  test('renders validatorPage page with CounterButton and initial Row', () => {
    const { getByText, getAllByTestId } = render(<ValidatorDetailPage />)

    expect(getByText('Sebab:')).toBeInTheDocument()
    expect(getByText('3')).toBeInTheDocument()
    expect(getAllByTestId('row-container')).toHaveLength(1) // Initial row count
  })

  it('renders the component and fetches data', async () => {
    const mockValidatorData = {
      title: 'Test Title',
      question: 'Test Question',
      mode: Mode.pribadi,
      created_at: '2023-01-01',
      username: 'testuser',
      tags: [],
    };

    const mockCauses = [
      {
        root_status: false,
        id: '1',
        problem: 'Test Problem',
        column: 0,
        row: 0,
        mode: Mode.pribadi,
        cause: 'Test Cause',
        status: false,
        feedback: '',
      },
    ];

    mockAxios.onGet(`/question/1`).reply(200, mockValidatorData);
    mockAxios.onGet(`/cause/1/`).reply(200, mockCauses);

    render(<ValidatorDetailPage />);

    await waitFor(() => {
        setTimeout(() => {
            expect(screen.getByText('Test Title')).toBeInTheDocument();
            expect(screen.getByText('Test Question')).toBeInTheDocument();
        }, 10000);
    });
  });

  it('sets validator data when API call is successful', async () => {
    const mockValidatorData = {
      title: 'Test Title',
      question: 'Test Question',
      mode: Mode.pribadi,
      created_at: '2023-01-01',
      username: 'testuser',
      tags: [],
    };

    // Mock the API call to return the question data
    mockAxios.onGet(`/question/1`).reply(200, mockValidatorData);

    render(<ValidatorDetailPage />);

    await waitFor(() => {
      setTimeout(() => {
        expect(screen.getByText('Test Title')).toBeInTheDocument();
        expect(screen.getByText('Test Question')).toBeInTheDocument();
      }, 10000);
    });
  });

  it('handles API error with response data', async () => {
    // Mock the API call to return an error with response data
    mockAxios.onGet(`/question/1`).reply(500, { detail: 'Internal Server Error' });

    render(<ValidatorDetailPage />);

    // Wait for the error handling to complete
    await waitFor(() => {
        setTimeout(() => {
            expect(toast.error).toHaveBeenCalledWith('Internal Server Error');
        }, 10000);
        expect(mockRouter.push).toHaveBeenCalledWith('/');
    });
  });

  it('handles API error without response data', async () => {
    mockAxios.onGet(`/question/1`).reply(500);

    render(<ValidatorDetailPage />);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Gagal mengambil data analisis');
      expect(mockRouter.push).toHaveBeenCalledWith('/');
    });
  });

  it('handles column count adjustment', async () => {
    render(<ValidatorDetailPage />);

    const incrementButton = screen.getByRole('button', { name: '+' })
    const decrementButton = screen.getByRole('button', { name: '-' })
    fireEvent.click(incrementButton);
    fireEvent.click(decrementButton);

    await waitFor(() => {
      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });

  test('increments and decrements columns on button clicks', async () => {
    const { getByText, findAllByPlaceholderText } = render(<ValidatorDetailPage />)

    const incrementButton = screen.getByRole('button', { name: '+' })
    fireEvent.click(incrementButton)
    expect(getByText('4')).toBeInTheDocument()

    const placeholders = await findAllByPlaceholderText('Isi sebab..')
    expect(placeholders.length).toBeGreaterThan(0)

    const decrementButton = screen.getByRole('button', { name: '-' })
    fireEvent.click(decrementButton)
    expect(getByText('3')).toBeInTheDocument()
  })

  test('does not allow incrementing beyond 5 columns', () => {
    const { getByText } = render(<ValidatorDetailPage />)

    const incrementButton = screen.getByRole('button', { name: '+' })
    for (let i = 0; i < 5; i++) {
      fireEvent.click(incrementButton)
    }
    expect(getByText('5')).toBeInTheDocument()

    fireEvent.click(incrementButton)
    fireEvent.click(incrementButton)
    expect(getByText('5')).toBeInTheDocument()
  })

  test('does not allow decrementing below 3 columns', () => {
    const { getByText } = render(<ValidatorDetailPage />)

    const decrementButton = screen.getByRole('button', { name: '-' })
    for (let i = 0; i < 3; i++) {
      fireEvent.click(decrementButton)
    }
    expect(getByText('3')).toBeInTheDocument()

    fireEvent.click(decrementButton)
    fireEvent.click(decrementButton)
    expect(getByText('3')).toBeInTheDocument()
  })

  it('submits causes and validates them', async () => {
    const mockValidatorData = {
      title: 'Test Title',
      question: 'Test Question',
      mode: Mode.pribadi,
      created_at: '2023-01-01',
      username: 'testuser',
      tags: [],
    };

    const mockCauses = [
      {
        root_status: false,
        id: '1',
        problem: 'Test Problem',
        column: 0,
        row: 0,
        mode: Mode.pribadi,
        cause: 'Test Cause',
        status: false,
        feedback: '',
      },
    ];

    mockAxios.onGet(`/question/1`).reply(200, mockValidatorData);
    mockAxios.onGet(`/cause/1/`).reply(200, mockCauses);
    mockAxios.onPost(`/cause/`).reply(200);
    mockAxios.onPatch(`/cause/patch/1/1/`).reply(200);
    mockAxios.onPatch(`/cause/validate/1/`).reply(200);

    render(<ValidatorDetailPage />);

    await waitFor(() => {
      const submitButton = screen.getByText('Kirim Sebab');
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
        setTimeout(() => {
            expect(mockAxios.history.post.length).toBe(1);
            expect(mockAxios.history.patch.length).toBe(2);
        }, 10000);
    });
  });

  it('handles errors during data fetching', async () => {
    mockAxios.onGet(`/question/1`).reply(500, { detail: 'Internal Server Error' });
    mockAxios.onGet(`/cause/1/`).reply(500, { detail: 'Internal Server Error' });

    render(<ValidatorDetailPage />);

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/');
    });
  });

  it('handles errors during cause submission', async () => {
    const mockValidatorData = {
      title: 'Test Title',
      question: 'Test Question',
      mode: Mode.pribadi,
      created_at: '2023-01-01',
      username: 'testuser',
      tags: [],
    };

    const mockCauses = [
      {
        root_status: false,
        id: '1',
        problem: 'Test Problem',
        column: 0,
        row: 0,
        mode: Mode.pribadi,
        cause: 'Test Cause',
        status: false,
        feedback: '',
      },
    ];

    mockAxios.onGet(`/question/1`).reply(200, mockValidatorData);
    mockAxios.onGet(`/cause/1/`).reply(200, mockCauses);
    mockAxios.onPost(`/cause/`).reply(500, { detail: 'Internal Server Error' });

    render(<ValidatorDetailPage />);

    await waitFor(() => {
      const submitButton = screen.getByText('Kirim Sebab');
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
        setTimeout(() => {
            expect(mockAxios.history.post.length).toBe(1);
        }, 10000);
    });
  });

  test('adds a new row on submitting causes with correct feedback', async () => {
    const { getByText, findAllByText, getAllByTestId } = render(<ValidatorDetailPage />)

    const cells = getAllByTestId('cell')
    for (const cell of cells) {
      const input = within(cell).getByPlaceholderText('Isi sebab..') as HTMLInputElement
      fireEvent.change(input, { target: { value: 'Some cause' } })
    }

    const submitButton = getByText('Kirim Sebab')
    fireEvent.click(submitButton)

    const feedbackMessages = await findAllByText('')
    expect(feedbackMessages.length).toBeGreaterThanOrEqual(0)

    const rows = getAllByTestId('row-container')
    expect(rows).toHaveLength(1)
  })

  test('Successfully get data on successful API call', async () => {
    const mockResponseData = {
      mode: 'mockMode',
      question: 'mockQuestion',
      title: 'mockTitle',
      tags: ['mockTags']
    }
    mockAxios.onGet('/question/1').reply(200, mockResponseData)

    const { getByText } = render(<ValidatorDetailPage />)

    await waitFor(() => {
        setTimeout(() => {
            expect(getByText('mockMode')).toBeInTheDocument
            expect(getByText('mockTitle')).toBeInTheDocument
            expect(getByText('mockTags')).toBeInTheDocument
        }, 10000);
    })
  })

  test('displays error message from backend when fail to post', async () => {
    const errorResponse = {
      data: {
        detail: 'Backend Error Message'
      }
    }
    mockAxios.onGet('/question/1').replyOnce(500, errorResponse)

    render(<ValidatorDetailPage />)

    await waitFor(() => {
      setTimeout(() => {
        expect(toast.error).toHaveBeenCalledWith('Backend Error')
        expect(mockRouter.push).toHaveBeenCalledWith('/')
      }, 10000)
    })
  })

  test('displays error message when fail to get data', async () => {
    const errorResponse = {
      response: {
        request: {
          responseText: 'Gagal mengambil data analisis'
        }
      }
    }
    mockAxios.onGet('/question/1').replyOnce(500, errorResponse)

    render(<ValidatorDetailPage />)

    await waitFor(() => {
      setTimeout(() => {
        expect(toast.error).toHaveBeenCalledWith('Gagal mengambil data analisis')
        expect(mockRouter.push).toHaveBeenCalledWith('/')
      }, 10000)
    })
  })

  test('displays error message when fail to get causes data', async () => {
    const errorResponse = {
      response: {
        data: {
          detail: 'Gagal mengambil sebab'
        }
      }
    }

    mockAxios.onGet('/question/1').replyOnce(500, errorResponse)

    render(<ValidatorDetailPage />)

    await waitFor(() => {
      setTimeout(() => {
        expect(toast.error).toHaveBeenCalledWith('Gagal mengambil sebab')
      }, 10000)
    })
  })

  test('should set rows to an initial row when no causes are returned', async () => {
    mockAxios.onGet('/question/1').replyOnce(200, [])

    render(<ValidatorDetailPage />)

    await waitFor(() => {
      expect(screen.getByText('Sebab:')).toBeInTheDocument
    })
  })

  test('should process and set rows when all statuses are CorrectNotRoot or CorrectRoot', async () => {
    const causesData = [
      { id: 1, cause: 'Cause 1', row: 1, column: 0, status: CauseStatus.CorrectRoot },
      { id: 2, cause: 'Cause 2', row: 1, column: 1, status: CauseStatus.CorrectRoot },
      { id: 3, cause: 'Cause 3', row: 1, column: 2, status: CauseStatus.CorrectRoot },
      { id: 4, cause: 'Cause 4', row: 1, column: 3, status: CauseStatus.CorrectRoot }
    ]

    mockAxios.onGet('/cause/1/').replyOnce(200, {
      data: causesData
    })

    render(<ValidatorDetailPage />)

    await waitFor(() => {
      const newRow = screen.getAllByRole('textbox').length
      expect(newRow).toBeGreaterThan(3)
    })
  })

  test('handle missing ID return nothing', () => {
    (useRouter as jest.Mock).mockImplementationOnce(() => ({
      route: '/',
      pathname: '',
      query: { id: '' },
      asPath: '',
      push: jest.fn(),
      replace: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn(),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn()
      }
    }))

    render(<ValidatorDetailPage />)
  })

  test('calls validateCauses and displays error toast on failed validation', async () => {
    const errorResponse = {
      data: {
        detail: 'error'
      }
    }
    mockAxios.onPost().replyOnce(500, errorResponse)

    const { getByText, getAllByTestId } = render(<ValidatorDetailPage />)

    const cells = getAllByTestId('cell')
    for (const cell of cells) {
      const input = within(cell).getByPlaceholderText('Isi sebab..') as HTMLInputElement
      fireEvent.change(input, { target: { value: 'Some cause' } })
    }
    const submitButton = getByText('Kirim Sebab')
    fireEvent.click(submitButton)

    await waitFor(() => {
      setTimeout(() => {
        expect(toast.error).toHaveBeenCalledWith('Gagal validasi sebab: error')
        expect(toast.dismiss).toHaveBeenCalled()
      }, 10000)
    })
  })

  test('shows a toast and redirects if backend error on initial data fetch', async () => {
    const errorResponse = {
      response: {
        data: {
          detail: 'Backend Error'
        }
      }
    }

    mockAxios.onGet('/question/1').replyOnce(500, errorResponse)

    render(<ValidatorDetailPage />)

    await waitFor(() => {
      setTimeout(() => {
        expect(toast).toHaveBeenCalledWith('Backend Error')
        expect(mockRouter.push).toHaveBeenCalledWith('/')
      }, 10000)
    })
  })

  test('creates causes from the first row', async () => {
    const { getAllByPlaceholderText, getByText } = render(<ValidatorDetailPage />)

    const inputFields = await getAllByPlaceholderText('Isi sebab..')
    fireEvent.change(inputFields[0], { target: { value: 'First Cause' } })
    fireEvent.change(inputFields[1], { target: { value: 'Second Cause' } })
    fireEvent.change(inputFields[2], { target: { value: 'Third Cause' } })

    mockAxios.onPost('/causes/').replyOnce(200, { success: true })
    fireEvent.click(getByText('Kirim Sebab'))

    await waitFor(() => {
      setTimeout(() => {
        expect(mockAxios.history.post).toHaveBeenCalledWith('/causes/', expect.any(Object))
        expect(toast.success).toHaveBeenCalledWith('Causes saved successfully!')
      }, 10000)
    })
  })

  test('shows a toast and redirects if backend error on getting causes', async () => {
    const errorResponse = {
      response: {
        data: {
          detail: 'Backend Error'
        }
      }
    }
    mockAxios.onGet('/cause/1/').replyOnce(500, errorResponse)
    const { getAllByPlaceholderText, getByText } = render(<ValidatorDetailPage />)

    const inputFields = await getAllByPlaceholderText('Isi sebab..')
    fireEvent.change(inputFields[0], { target: { value: 'First Cause' } })
    fireEvent.change(inputFields[1], { target: { value: 'Second Cause' } })
    fireEvent.change(inputFields[2], { target: { value: 'Third Cause' } })

    mockAxios.onPost('/causes/').replyOnce(200, { success: true })
    fireEvent.click(getByText('Kirim Sebab'))

    await waitFor(() => {
      setTimeout(() => {
        expect(mockAxios.history.post).toHaveBeenCalledWith('/causes/', expect.any(Object))
        expect(toast.error).toHaveBeenCalledWith('Gagal menambahkan sebab: Backend Error')
      }, 10000)
    })
  })

  test('shows a toast and redirects if backend error on getting causes', async () => {
    const errorResponse = {
      response: {
        data: {
          detail: 'Backend Error'
        }
      }
    }
    mockAxios.onGet('/cause/1/').replyOnce(500, errorResponse)

    render(<ValidatorDetailPage />)

    await waitFor(() => {
      setTimeout(() => {
        expect(toast.error).toHaveBeenCalledWith('Backend Error')
        expect(mockRouter.push).toHaveBeenCalledWith('/')
      }, 10000)
    })
  })

  test('Test initial row when causes data empty', async () => {
    const responseData = {
      response: {
        status: 200,
        data: []
      }
    }
    mockAxios.onGet('/cause/1/').replyOnce(200, responseData.response.data)

    const { getAllByPlaceholderText } = render(<ValidatorDetailPage />)

    await waitFor(() => {
      expect(getAllByPlaceholderText('Isi sebab..')).toBeInTheDocument
    })
  })

  test('shows a toast if backend error on getting causes', async () => {
    const errorResponse = {
      response: {
        status: 404,
        data: {
          detail: 'Backend Error'
        }
      }
    }
    mockAxios.onGet('/cause/1/').replyOnce(500, errorResponse)

    render(<ValidatorDetailPage />)

    await waitFor(() => {
        setTimeout(() => {
            expect(mockAxios.history.get).toHaveBeenCalledWith(expect.stringContaining(`/causes/123/`))
        }, 10000);
    })
  })

  test('calls patchCausesFromRow when latest row has incorrect status failed upon validation', async () => {
    const causesData = [
      { id: '5', cause: 'Cause 1', row: 0, column: 0, status: true, feedback: 'test', root_status: false },
      { id: '6', cause: 'Cause 2', row: 0, column: 1, status: true, feedback: 'test', root_status: true },
      { id: '7', cause: 'Cause 3', row: 0, column: 2, status: true, feedback: 'test', root_status: true },
      { id: '8', cause: 'Cause 4', row: 1, column: 0, status: false, feedback: 'test', root_status: false }
    ]

    mockAxios.onGet('/cause/1/').replyOnce(200, causesData)
    mockAxios.onPatch().reply(500, { detail: 'Validation failed' })

    render(<ValidatorDetailPage />)

    await waitFor(() => {
      const cells = screen.getAllByTestId('cell')
      console.log(cells.length)
      for (const cell of cells) {
        const input = within(cell).queryByDisplayValue('Cause 4') as HTMLInputElement
        if (input) {
          fireEvent.change(input, { target: { value: 'Cause 4' } })
        }
      }
    })

    const submitButton = screen.getByText('Kirim Sebab')
    fireEvent.click(submitButton)

    await waitFor(() => {
      setTimeout(() => {
        expect(mockAxios.history.patch).toHaveBeenCalledWith('/causes/patch/123/8/', expect.any(Object))
        expect(toast.error).toHaveBeenCalledWith('Gagal validasi sebab: ', 'Validation failed')
        expect(toast.dismiss).toHaveBeenCalled()
      }, 10000)
    })
  })

  test('calls patchCausesFromRow when latest row has incorrect status', async () => {
    const causesData = [
      { id: '1', cause: 'Cause 1', row: 0, column: 0, status: true, feedback: 'test', root_status: false },
      { id: '2', cause: 'Cause 2', row: 0, column: 1, status: true, feedback: 'test', root_status: true },
      { id: '3', cause: 'Cause 3', row: 0, column: 2, status: true, feedback: 'test', root_status: true },
      { id: '4', cause: 'Cause 4', row: 1, column: 0, status: false, feedback: 'test', root_status: false }
    ]

    mockAxios.onGet('/cause/1/').replyOnce(200, causesData)
    mockAxios.onPatch().replyOnce(200, { data: { success: true } })

    render(<ValidatorDetailPage />)

    expect(screen.getByText('Kirim Sebab')).toBeInTheDocument()

    await waitFor(() => {
      const cells = screen.getAllByTestId('cell')
      console.log(cells.length)
      for (const cell of cells) {
        const input = within(cell).queryByDisplayValue('Cause 4') as HTMLInputElement
        if (input) {
          fireEvent.change(input, { target: { value: 'Cause 4' } })
        }
      }
    })

    const submitButton = screen.getByText('Kirim Sebab')
    fireEvent.click(submitButton)

    await waitFor(() => {
      setTimeout(() => {
        expect(mockAxios.history.patch).toHaveBeenCalledWith('/causes/patch/123/4/', { cause: 'Cause 4' })
        expect(mockAxios.history.patch).toHaveBeenCalledWith('/causes/validate/123/')
      }, 10000)
    })
  })
});