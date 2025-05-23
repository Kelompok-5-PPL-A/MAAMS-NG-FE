import React from 'react';
import { render, fireEvent, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import ValidatorDetailPage from '../../pages/validator/[id]';
import axiosInstance from '../../services/axiosInstance';
import { toast } from 'react-hot-toast';
import { SessionProvider } from 'next-auth/react';
import userEvent from '@testing-library/user-event';

// Mock all external dependencies
jest.mock('../../services/axiosInstance', () => ({
  post: jest.fn(),
  get: jest.fn(),
  patch: jest.fn(),
}));
const mockedAxios = axiosInstance as jest.Mocked<typeof axiosInstance>;

// Mock Next.js router
const mockPush = jest.fn();
const mockReplace = jest.fn();
const useRouterMock = jest.spyOn(require('next/router'), 'useRouter');

useRouterMock.mockImplementation(() => ({
  route: '/validator/[id]',
  pathname: '/validator/[id]',
  query: { id: '123' },
  asPath: '/validator/123',
  push: mockPush,
  replace: mockReplace,
  reload: jest.fn(),
  back: jest.fn(),
  prefetch: jest.fn(),
  beforePopState: jest.fn(),
  events: {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
  },
}));

// Mock react-hot-toast
jest.mock('react-hot-toast', () => {
    const mockError = jest.fn();
    const mockSuccess = jest.fn();
    const mockLoading = jest.fn(() => 'toast-id');
    const mockDismiss = jest.fn();

    return {
      __esModule: true,
      default: {
        error: mockError,
        success: mockSuccess,
        loading: mockLoading,
        dismiss: mockDismiss,
      },
      toast: {
        error: mockError,
        success: mockSuccess,
        loading: mockLoading,
        dismiss: mockDismiss,
      },
      error: mockError,
      success: mockSuccess,
      loading: mockLoading,
      dismiss: mockDismiss,
      Toaster: () => null, // Mock component Toaster
    };
});
  
let mockToastError: jest.Mock;
let mockToastSuccess: jest.Mock;
let mockToastLoading: jest.Mock;
let mockToastDismiss: jest.Mock;

const toastMockObject = jest.requireMock('react-hot-toast');
if (toastMockObject.toast) {
    mockToastError = toastMockObject.toast.error;
    mockToastSuccess = toastMockObject.toast.success;
    mockToastLoading = toastMockObject.toast.loading;
    mockToastDismiss = toastMockObject.toast.dismiss;
} else if (toastMockObject.default) {
    mockToastError = toastMockObject.default.error;
    mockToastSuccess = toastMockObject.default.success;
    mockToastLoading = toastMockObject.default.loading;
    mockToastDismiss = toastMockObject.default.dismiss;
} else {
    mockToastError = toastMockObject.error;
    mockToastSuccess = toastMockObject.success;
    mockToastLoading = toastMockObject.loading;
    mockToastDismiss = toastMockObject.dismiss;
}

// Wrapper component with SessionProvider
const WrappedValidatorDetailPage = () => (
  <SessionProvider session={null}>
    <ValidatorDetailPage />
  </SessionProvider>
);

// Sample data structures
const mockValidatorData = {
  mode: 'pribadi',
  question: 'Test Question',
  title: 'Test Title',
  tags: ['test', 'sample'],
  created_at: '2023-01-01',
  username: 'testuser',
};

const mockCausesData = [
  {
    id: 'cause1',
    problem: 'Problem 1',
    column: 0,
    row: 1,
    mode: 'pribadi',
    cause: 'First Cause',
    status: true,
    root_status: false,
    feedback: '',
  },
  {
    id: 'cause2',
    problem: 'Problem 1',
    column: 1,
    row: 1,
    mode: 'pribadi',
    cause: 'Second Cause',
    status: true,
    root_status: false,
    feedback: '',
  },
  {
    id: 'cause3',
    problem: 'Problem 1',
    column: 2,
    row: 1,
    mode: 'pribadi',
    cause: 'Third Cause',
    status: true,
    root_status: false,
    feedback: 'Good job',
  },
];

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();

  // Default successful API responses
  mockedAxios.get.mockImplementation((url) => {
    if (url.includes('/question/')) {
      return Promise.resolve({ data: mockValidatorData });
    } else if (url.includes('/cause/')) {
      return Promise.resolve({ data: mockCausesData });
    }
    return Promise.resolve({ data: {} });
  });
  
  mockedAxios.post.mockResolvedValue({ data: { success: true } });
  mockedAxios.patch.mockResolvedValue({ data: mockCausesData });
});

describe('ValidatorDetailPage', () => {
  test('renders without crashing and loads initial data', async () => {
    render(<WrappedValidatorDetailPage />)
    
    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith('api/v1/question/123')
      expect(mockedAxios.get).toHaveBeenCalledWith('api/v1/cause/123/')
    })
  })

  test('handles API error when getting question data', async () => {
    mockedAxios.get.mockImplementationOnce((url) => {
      if (url.includes('/question/')) {
        return Promise.reject(new Error('API Error'))
      }
      return Promise.resolve({ data: {} })
    })
    
    render(<WrappedValidatorDetailPage />)
    
    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('Gagal mengambil data analisis')
      expect(mockPush).toHaveBeenCalledWith('/')
    })
  })

  test('handles API error when getting causes data', async () => {
    mockedAxios.get.mockImplementation((url) => {
      if (url.includes('/question/')) {
        return Promise.resolve({ data: mockValidatorData })
      } else if (url.includes('/cause/')) {
        return Promise.reject(new Error('Failed to fetch causes'))
      }
      return Promise.resolve({ data: {} })
    })
    
    render(<WrappedValidatorDetailPage />)
    
    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('Gagal mengambil sebab')
    })
  })

  test('handles column count adjustment correctly', async () => {
    render(<WrappedValidatorDetailPage />)
    
    const incrementButton = screen.getByRole('button', { name: '+' })
    const decrementButton = screen.getByRole('button', { name: '-' })
    
    // Test increment
    fireEvent.click(incrementButton)
    expect(screen.getByText('4')).toBeInTheDocument()
    
    // Test decrement
    fireEvent.click(decrementButton)
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  test('handles root cause detection correctly', async () => {
    const rootCauseData = [
      {
        id: 'cause1',
        column: 0,
        row: 1,
        mode: 'pribadi',
        cause: 'Root Cause',
        status: true,
        root_status: true,
        feedback: 'Root found'
      }
    ]

    mockedAxios.get.mockImplementation((url) => {
      if (url.includes('/cause/')) return Promise.resolve({ data: rootCauseData })
      return Promise.resolve({ data: mockValidatorData })
    })

    render(<WrappedValidatorDetailPage />)

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith('api/v1/cause/123/')
    })
  })

  test('handles working column progression correctly', async () => {
    const progressionData = [
      {
        id: 'cause1',
        column: 0,
        row: 1,
        mode: 'pribadi',
        cause: 'First Cause',
        status: true,
        root_status: false,
        feedback: 'Good'
      },
      {
        id: 'cause2',
        column: 0,
        row: 2,
        mode: 'pribadi',
        cause: 'Second Cause',
        status: true,
        root_status: true,
        feedback: 'Root found'
      }
    ]
  
    mockedAxios.get.mockImplementation((url) => {
      if (url.includes('/cause/')) return Promise.resolve({ data: progressionData })
      return Promise.resolve({ data: mockValidatorData })
    })

    render(<WrappedValidatorDetailPage />)

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith('api/v1/cause/123/')
    })
  })

  test('handles empty causes data correctly', async () => {
    mockedAxios.get.mockImplementation((url) => {
      if (url.includes('/cause/')) return Promise.resolve({ data: [] })
      return Promise.resolve({ data: mockValidatorData })
    })

    render(<WrappedValidatorDetailPage />)

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith('api/v1/cause/123/')
    })
  })

  test('handles multiple columns with different statuses', async () => {
    const multiColumnData = [
      {
        id: 'cause1',
        column: 0,
        row: 1,
        mode: 'pribadi',
        cause: 'First Cause',
        status: true,
        root_status: false,
        feedback: 'Good'
      },
      {
        id: 'cause2',
        column: 1,
        row: 1,
        mode: 'pribadi',
        cause: 'Second Cause',
        status: false,
        root_status: false,
        feedback: 'Try again'
      },
      {
        id: 'cause3',
        column: 2,
        row: 1,
        mode: 'pribadi',
        cause: 'Third Cause',
        status: true,
        root_status: true,
        feedback: 'Root found'
      }
    ]

    mockedAxios.get.mockImplementation((url) => {
      if (url.includes('/cause/')) return Promise.resolve({ data: multiColumnData })
      return Promise.resolve({ data: mockValidatorData })
    })

    render(<WrappedValidatorDetailPage />)

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith('api/v1/cause/123/')
    })
  })

  test('handles completion of all columns correctly', async () => {
    // Setup with all columns having root causes (completed analysis)
    const allColumnsCompleteData = [
      {
        id: 'cause1',
        column: 0,
        row: 1,
        mode: 'pribadi',
        cause: 'First A',
        status: true,
        root_status: false,
        feedback: ''
      },
      {
        id: 'cause2', 
        column: 0,
        row: 2,
        mode: 'pribadi',
        cause: 'Second A', 
        status: true,
        root_status: true, // Root for A
        feedback: 'Root A'
      },
      {
        id: 'cause3',
        column: 1,
        row: 1,
        mode: 'pribadi',
        cause: 'First B',
        status: true,
        root_status: false,
        feedback: ''
      },
      {
        id: 'cause4',
        column: 1,
        row: 2,
        mode: 'pribadi',
        cause: 'Second B',
        status: true,
        root_status: true, // Root for B
        feedback: 'Root B'
      },
      {
        id: 'cause5',
        column: 2,
        row: 1,
        mode: 'pribadi',
        cause: 'First C',
        status: true,
        root_status: true, // Root for C
        feedback: 'Root C'
      },
      {
        id: 'cause6',
        column: 3,
        row: 1,
        mode: 'pribadi',
        cause: 'First D',
        status: true,
        root_status: true, // Root for D
        feedback: 'Root D'
      },
      {
        id: 'cause7',
        column: 4,
        row: 1,
        mode: 'pribadi',
        cause: 'First E',
        status: true,
        root_status: true, // Root for E
        feedback: 'Root E'
      }
    ];
    
    mockedAxios.get.mockImplementation((url) => {
      if (url.includes('/question/')) {
        return Promise.resolve({ data: mockValidatorData });
      } else if (url.includes('/cause/')) {
        return Promise.resolve({ data: allColumnsCompleteData });
      }
      return Promise.resolve({ data: {} });
    });
    
    render(<WrappedValidatorDetailPage />);
    
    // Wait for initial render
    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith('api/v1/cause/123/');
    });
    
    // There should be a completion message
    await waitFor(() => {
      const completionMessage = screen.getByText(/Analisis akar masalah selesai!/i);
      expect(completionMessage).toBeInTheDocument();
      
      // Submit button should not be visible anymore
      const submitButton = screen.queryByRole('button', { name: /kirim sebab/i });
      expect(submitButton).not.toBeInTheDocument();
    });
  });

  test('handles submit with empty causes', async () => {
    render(<WrappedValidatorDetailPage />);
    
    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalled();
    });
    
    const submitButton = screen.getByRole('button', { name: /kirim sebab/i });
    expect(submitButton).toBeDisabled();
  });

  test('handles column adjustment when not allowed', async () => {
    render(<WrappedValidatorDetailPage />);
    
    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalled();
    });
    
    // After data loads, column adjustment should be disabled
    const incrementButton = screen.getByRole('button', { name: '+' });
    const decrementButton = screen.getByRole('button', { name: '-' });
    
    fireEvent.click(incrementButton);
    fireEvent.click(decrementButton);
    
    // Column count should remain the same (3)
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  test('handles submit with invalid causes', async () => {
    // Mock empty initial state
    mockedAxios.get.mockImplementation((url) => {
      if (url.includes('/cause/')) return Promise.resolve({ data: [] });
      return Promise.resolve({ data: mockValidatorData });
    });
  
    render(<WrappedValidatorDetailPage />);
    
    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalled();
    });
    
    // Get textarea by test ID
    const textareaA1 = screen.getByTestId('input-A1');
    await userEvent.type(textareaA1, 'Test cause');
    
    const submitButton = screen.getByRole('button', { name: /kirim sebab/i });
    expect(submitButton).not.toBeDisabled();
    
    // Mock API responses
    mockedAxios.post.mockResolvedValueOnce({ data: { id: 'new-cause' } });
    mockedAxios.patch.mockResolvedValueOnce({
      data: [{
        id: 'new-cause',
        column: 0,
        row: 1,
        cause: 'Test cause',
        status: false,
        root_status: false,
        feedback: 'Try again'
      }]
    });
    
    await userEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalled();
      expect(mockToastLoading).toHaveBeenCalled();
    });
  });
  
  test('handles automatic row addition when needed', async () => {
    const causesWithValidRow1 = [
      {
        id: 'cause1',
        column: 0,
        row: 1,
        mode: 'pribadi',
        cause: 'Valid Cause',
        status: true,
        root_status: false,
        feedback: 'Good'
      }
    ];

    mockedAxios.get.mockImplementation((url) => {
      if (url.includes('/cause/')) return Promise.resolve({ data: causesWithValidRow1 });
      return Promise.resolve({ data: mockValidatorData });
    });

    render(<WrappedValidatorDetailPage />);

    await waitFor(() => {
      // Check for textareas - should be at least 2 (row 1 and row 2)
      const textareas = screen.getAllByRole('textbox');
      expect(textareas.length).toBeGreaterThan(1);
      // Second textarea should not be disabled
      expect(textareas[1]).not.toBeDisabled();
    });
  });

  test('disables textareas correctly', async () => {
    const causesWithDisabled = [
      {
        id: 'cause1',
        column: 0,
        row: 1,
        mode: 'pribadi',
        cause: 'Valid Cause',
        status: true,
        root_status: false,
        feedback: 'Good'
      }
    ];
    
    mockedAxios.get.mockImplementation((url) => {
      if (url.includes('/cause/')) return Promise.resolve({ data: causesWithDisabled });
      return Promise.resolve({ data: mockValidatorData });
    });
    
    render(<WrappedValidatorDetailPage />);
    
    await waitFor(() => {
      const textareas = screen.getAllByRole('textbox');
      // First textarea (validated cause) should be disabled
      expect(textareas[0]).toBeDisabled();
    });
  });

  test('handles pending inputs correctly', async () => {
    // Mock initial empty state
    mockedAxios.get.mockImplementation((url) => {
      if (url.includes('/cause/')) return Promise.resolve({ data: [] });
      return Promise.resolve({ data: mockValidatorData });
    });
  
    render(<WrappedValidatorDetailPage />);
  
    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalled();
    });
    
    // Simulate user input in multiple cells
    const inputA1 = screen.getByLabelText('A1');
    const inputB1 = screen.getByLabelText('B1');
    const inputC1 = screen.getByLabelText('C1');
    
    await userEvent.type(inputA1, 'Pending A1');
    await userEvent.type(inputB1, 'Pending B1');
    await userEvent.type(inputC1, 'Pending C1');
    
    // Mock API response that only validates some inputs
    mockedAxios.post.mockResolvedValue({ data: { id: 'new-cause' } });
    mockedAxios.patch.mockResolvedValueOnce({
      data: [
        {
          id: 'cause1',
          column: 0,
          row: 1,
          cause: 'Pending A1',
          status: true,
          root_status: false,
          feedback: 'Validated'
        },
        {
          id: 'cause2',
          column: 1,
          row: 1,
          cause: 'Pending B1',
          status: false,
          root_status: false,
          feedback: 'Invalid'
        }
      ]
    });
    
    const submitButton = screen.getByRole('button', { name: /kirim sebab/i });
    await userEvent.click(submitButton);
    
    await waitFor(() => {
      // B1 should still show the pending input
      expect(screen.getByLabelText('B1')).toHaveValue('Pending B1');
      // C1 should still be there since we didn't mock a response for it
      expect(screen.getByLabelText('C1')).toHaveValue('Pending C1');
    });
  });

  test('handles error during cause validation', async () => {
    // Mock initial empty state
    mockedAxios.get.mockImplementation((url) => {
      if (url.includes('/cause/')) return Promise.resolve({ data: [] });
      return Promise.resolve({ data: mockValidatorData });
    });
  
    mockedAxios.post.mockResolvedValueOnce({ data: { id: 'new-cause' } });
    mockedAxios.patch.mockRejectedValueOnce(new Error('Validation failed'));
    
    render(<WrappedValidatorDetailPage />);
    
    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalled();
    });
    
    // Simulate user input
    const inputA1 = screen.getByLabelText('A1');
    await userEvent.type(inputA1, 'Test cause');
    
    const submitButton = screen.getByRole('button', { name: /kirim sebab/i });
    await userEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalled();
      expect(mockToastDismiss).toHaveBeenCalled();
    });
  });

  test('handles pending inputs correctly', async () => {
    // Mock initial empty state
    mockedAxios.get.mockImplementation((url) => {
      if (url.includes('/cause/')) return Promise.resolve({ data: [] });
      return Promise.resolve({ data: mockValidatorData });
    });
  
    render(<WrappedValidatorDetailPage />);
    
    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalled();
    });
    
    // Simulate user input in multiple cells
    const inputA1 = screen.getByLabelText('A1');
    const inputB1 = screen.getByLabelText('B1');
    const inputC1 = screen.getByLabelText('C1');
    
    await userEvent.type(inputA1, 'Pending A1');
    await userEvent.type(inputB1, 'Pending B1');
    await userEvent.type(inputC1, 'Pending C1');
    
    // Mock API response that only validates some inputs
    mockedAxios.post.mockResolvedValue({ data: { id: 'new-cause' } });
    mockedAxios.patch.mockResolvedValueOnce({
      data: [
      {
        id: 'cause1',
        column: 0,
        row: 1,
          cause: 'Pending A1',
        status: true,
          root_status: false,
          feedback: 'Validated'
      },
      {
        id: 'cause2',
        column: 1,
        row: 1,
          cause: 'Pending B1',
          status: false,
          root_status: false,
          feedback: 'Invalid'
        }
      ]
    });
    
    const submitButton = screen.getByRole('button', { name: /kirim sebab/i });
    await userEvent.click(submitButton);
    
    await waitFor(() => {
      // B1 should still show the pending input
      expect(screen.getByLabelText('B1')).toHaveValue('Pending B1');
      // C1 should still be there since we didn't mock a response for it
      expect(screen.getByLabelText('C1')).toHaveValue('Pending C1');
    });
  });

  test('handles error during cause submission', async () => {
    // Mock initial empty state
    mockedAxios.get.mockImplementation((url) => {
      if (url.includes('/cause/')) return Promise.resolve({ data: [] });
        return Promise.resolve({ data: mockValidatorData });
    });
  
    mockedAxios.post.mockRejectedValueOnce(new Error('Submission failed'));
    
    render(<WrappedValidatorDetailPage />);
    
    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalled();
    });
    
    // Simulate user input
    const inputA1 = screen.getByLabelText('A1');
    await userEvent.type(inputA1, 'Test cause');
    
    const submitButton = screen.getByRole('button', { name: /kirim sebab/i });
    await userEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith(expect.stringContaining('Gagal menambahkan sebab'));
    });
  });
})