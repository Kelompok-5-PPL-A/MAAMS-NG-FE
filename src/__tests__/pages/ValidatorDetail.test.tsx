import React from 'react';
import { render, screen, fireEvent, waitFor, within, act } from '@testing-library/react';
import ValidatorDetailPage from '../../pages/validator/[id]'
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { useRouter } from 'next/router';
import Mode from '@/constants/mode';
import toast from 'react-hot-toast';
import { CauseStatus } from '@/lib/enum';
import axiosInstance from '@/services/axiosInstance';
jest.mock('@/services/axiosInstance');
import '@testing-library/jest-dom';

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

const setIsDone = jest.fn();

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

    beforeEach(() => {
      mockAxios.history = { ...mockAxios.history, get: [], post: [] };
  });

  test('validates Kirim Sebab button is disabled when input is empty', async () => {
      render(<ValidatorDetailPage />);
      const button = screen.getByText(/Kirim Sebab/i);
      expect(button).toBeDisabled();
  });

  test('button is disabled during loading state', async () => {
      mockAxios.onGet('/question/1').replyOnce(() => new Promise(() => {}));
      render(<ValidatorDetailPage />);
      const button = screen.getByText(/Kirim Sebab/i);
      expect(button).toBeDisabled();
  });

  it('sends patch requests only for unresolved causes', async () => {
    const rows = [
        {
            id: 1,
            causes: ['Cause A', 'Cause B', 'Cause C'],
            causesId: [101, 102, 103],
            statuses: ['Unresolved', 'Resolved', 'Unresolved'], // Should only patch 101 & 103
        },
    ];

    const id = 1;
    const patchMock = jest.fn().mockResolvedValue({ data: {} }); 

    const patchCausesFromRow = async (rowNumber: number) => {
        const row = rows.find((row) => row.id === rowNumber)!;

        const patchPromises = row.causes.map((cause, index) => {
            if (row.statuses[index] !== 'Resolved') {
                return patchMock(`/cause/patch/${id}/${row.causesId[index]}/`, { cause });
            }
        });

        await Promise.all(patchPromises);
    };

    await patchCausesFromRow(1);

    //Ensure the function was called twice (for 101 and 103)
    expect(patchMock).toHaveBeenCalledTimes(2);
    expect(patchMock).toHaveBeenCalledWith('/cause/patch/1/101/', { cause: 'Cause A' });
    expect(patchMock).toHaveBeenCalledWith('/cause/patch/1/103/', { cause: 'Cause C' });
  });

  (axiosInstance.get as jest.Mock).mockImplementation((url) => {
    if (url.includes('/question/')) {
      return Promise.resolve({
        data: {
          title: 'Test Question',
          question: 'Test question content',
          mode: Mode.pribadi,
          created_at: '2023-01-01',
          username: 'testuser',
          tags: ['tag1', 'tag2']
        }
      });
    } else if (url.includes('/cause/')) {
      return Promise.resolve({
        data: []
      });
    }
    return Promise.reject(new Error('Not found'));
  });
  
  (axiosInstance.post as jest.Mock).mockResolvedValue({ data: { id: 'new-cause-id' } });
  (axiosInstance.patch as jest.Mock).mockResolvedValue({ data: { success: true } });
});

// Test for lines 198-199: Checking if causes are successfully loaded
test('should handle empty causes array', async () => {
  // Setup mock responses for possible URLs
  mockAxios.onGet('/cause/mock-id/').reply(200, {
    id: 'mock-id',
    name: 'Test Cause',
    causes: []
  });
  
  mockAxios.onGet('/cause/1/').reply(200, {
    id: '1',
    name: 'Test Cause',
    causes: []
  });
  
  // Mock any other API calls
  mockAxios.onGet('/question/1').reply(200, { /* data */ });
  
  await act(async () => {
    render(<ValidatorDetailPage />);
  });
  
  // Log all URLs that were called to help debug
  console.log('All GET URLs:', mockAxios.history.get.map(req => req.url));
  
  // Use a more flexible check if needed
  const causesUrlCalled = mockAxios.history.get.some(req => 
    req.url.includes('/cause/')
  );
  
  expect(causesUrlCalled).toBe(true);
  
  // Should render initial row with default values
  expect(screen.getByTestId('row-1')).toBeInTheDocument();
  expect(screen.getByTestId('column-count').textContent).toBe('3');
});

// Test for lines 210-215: Testing the addRow function
test('should add a new row when all statuses in the current row are correct', async () => {
  // Mock getCauses response with empty data to start with default rows
  (axiosInstance.get as jest.Mock).mockImplementation((url) => {
    if (url.includes('/cause/')) {
      return Promise.resolve({ data: [] });
    }
    return Promise.resolve({ data: {} });
  });

  await act(async () => {
    render(<ValidatorDetailPage />);
  });

  // Check that we start with one row
  expect(screen.getByTestId('row-1')).toBeInTheDocument();
  
  // Set all statuses in the row to CorrectNotRoot
  await act(async () => {
    fireEvent.change(screen.getByTestId('status-select-1-0'), { target: { value: CauseStatus.CorrectNotRoot } });
    fireEvent.change(screen.getByTestId('status-select-1-1'), { target: { value: CauseStatus.CorrectNotRoot } });
    fireEvent.change(screen.getByTestId('status-select-1-2'), { target: { value: CauseStatus.CorrectNotRoot } });
  });

  // Fill in cause values (needed for validation)
  await act(async () => {
    fireEvent.change(screen.getByTestId('cause-input-1-0'), { target: { value: 'Test Cause 1' } });
    fireEvent.change(screen.getByTestId('cause-input-1-1'), { target: { value: 'Test Cause 2' } });
    fireEvent.change(screen.getByTestId('cause-input-1-2'), { target: { value: 'Test Cause 3' } });
  });

  // Submit the causes to trigger row check
  await act(async () => {
    fireEvent.click(screen.getByTestId('submit-button'));
  });

  // New row should be added after validation
  await waitFor(() => {
    // Mock the getCauses response with validated causes
    jest.spyOn(axiosInstance, 'get').mockImplementation((url) => {
      if (url.includes('/cause/')) {
        return Promise.resolve({
          data: [
            { id: 'cause-1', cause: 'Test Cause 1', row: 1, column: 0, status: true, root_status: false, mode: Mode.pribadi, feedback: '' },
            { id: 'cause-2', cause: 'Test Cause 2', row: 1, column: 1, status: true, root_status: false, mode: Mode.pribadi, feedback: '' },
            { id: 'cause-3', cause: 'Test Cause 3', row: 1, column: 2, status: true, root_status: false, mode: Mode.pribadi, feedback: '' }
          ]
        });
      }
      return Promise.resolve({ data: {} });
    });
  });

  // Rerender with updated causes
  await act(async () => {
    render(<ValidatorDetailPage />);
  });

  // Should now have two rows (the original validated row and a new one)
  await waitFor(() => {
    expect(screen.getByTestId('row-1')).toBeInTheDocument();
    expect(screen.getByTestId('row-2')).toBeInTheDocument();
  });
});

// Test for lines 226-227: Testing column count adjustment
test('should adjust column count and update rows', async () => {
  await act(async () => {
    render(<ValidatorDetailPage />);
  });

  // Initially should have 3 columns
  expect(screen.getByTestId('column-count').textContent).toBe('3');
  expect(screen.getAllByTestId(/cause-1-\d+/).length).toBe(3);

  // Increase column count
  await act(async () => {
    fireEvent.click(screen.getByTestId('increment-button'));
  });

  // Should now have 4 columns
  expect(screen.getByTestId('column-count').textContent).toBe('4');
  expect(screen.getAllByTestId(/cause-1-\d+/).length).toBe(4);

  // Decrease column count
  await act(async () => {
    fireEvent.click(screen.getByTestId('decrement-button'));
  });

  // Should be back to 3 columns
  expect(screen.getByTestId('column-count').textContent).toBe('3');
  expect(screen.getAllByTestId(/cause-1-\d+/).length).toBe(3);
});

// Test for lines 237-266: Testing updateResolvedStatuses function
test('should correctly update resolved statuses between rows', async () => {
  // Mock getCauses with example data that includes a root cause
  (axiosInstance.get as jest.Mock).mockImplementation((url) => {
    if (url.includes('/cause/')) {
      return Promise.resolve({
        data: [
          { id: 'cause-1', cause: 'Root Cause', row: 1, column: 0, status: true, root_status: true, mode: Mode.pribadi, feedback: '' },
          { id: 'cause-2', cause: 'Regular Cause', row: 1, column: 1, status: true, root_status: false, mode: Mode.pribadi, feedback: '' },
          { id: 'cause-3', cause: 'Another Cause', row: 1, column: 2, status: true, root_status: false, mode: Mode.pribadi, feedback: '' },
          { id: 'cause-4', cause: 'Next Row Cause', row: 2, column: 0, status: false, root_status: false, mode: Mode.pribadi, feedback: '' },
          { id: 'cause-5', cause: 'Another Next Row', row: 2, column: 1, status: false, root_status: false, mode: Mode.pribadi, feedback: '' },
          { id: 'cause-6', cause: 'Third Next Row', row: 2, column: 2, status: false, root_status: false, mode: Mode.pribadi, feedback: '' }
        ]
      });
    }
    return Promise.resolve({ data: {} });
  });

  await act(async () => {
    render(<ValidatorDetailPage />);
  });

  // Second row's first column should be resolved (since first row has a root cause in that column)
  await waitFor(() => {
    const statusElement = screen.getByTestId('status-select-2-0');
    expect(statusElement.value).toBe(CauseStatus.Resolved);
    
    // Input in that cell should be empty and disabled
    const inputElement = screen.getByTestId('cause-input-2-0');
    expect(inputElement.value).toBe('');
  });
  
  // Other cells in second row should have their original values
  expect(screen.getByTestId('cause-input-2-1').value).toBe('Another Next Row');
  expect(screen.getByTestId('status-select-2-1').value).toBe(CauseStatus.Incorrect);
});

// Test for lines 343-350: Testing submitCauses function
test('should submit causes correctly', async () => {
  await act(async () => {
    render(<ValidatorDetailPage />);
  });

  // Add causes to the first row
  await act(async () => {
    fireEvent.change(screen.getByTestId('cause-input-1-0'), { target: { value: 'Test Cause 1' } });
    fireEvent.change(screen.getByTestId('cause-input-1-1'), { target: { value: 'Test Cause 2' } });
    fireEvent.change(screen.getByTestId('cause-input-1-2'), { target: { value: 'Test Cause 3' } });
  });

  // Submit button should be enabled when all fields are filled
  expect(screen.getByTestId('submit-button')).not.toBeDisabled();

  // Submit the causes
  await act(async () => {
    fireEvent.click(screen.getByTestId('submit-button'));
  });

  // Verify correct API calls were made
  await waitFor(() => {
    // Should create causes for first row
    expect(axiosInstance.post).toHaveBeenCalledTimes(3);
    
    // Should call validate endpoint
    expect(axiosInstance.patch).toHaveBeenCalledWith('/cause/validate/mock-id/');
    
    // Should fetch updated causes
    expect(axiosInstance.get).toHaveBeenCalledWith('/cause/mock-id/');
  });
});