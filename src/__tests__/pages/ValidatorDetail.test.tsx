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
      expect(mockedAxios.get).toHaveBeenCalledWith('/question/123')
      expect(mockedAxios.get).toHaveBeenCalledWith('/cause/123/')
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
      expect(mockedAxios.get).toHaveBeenCalledWith('/cause/123/')
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
      expect(mockedAxios.get).toHaveBeenCalledWith('/cause/123/')
    })
  })

  test('handles empty causes data correctly', async () => {
    mockedAxios.get.mockImplementation((url) => {
      if (url.includes('/cause/')) return Promise.resolve({ data: [] })
      return Promise.resolve({ data: mockValidatorData })
    })

    render(<WrappedValidatorDetailPage />)

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith('/cause/123/')
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
      expect(mockedAxios.get).toHaveBeenCalledWith('/cause/123/')
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
      expect(mockedAxios.get).toHaveBeenCalledWith('/cause/123/');
    });
    
    // There should be a completion message
    await waitFor(() => {
      expect(screen.getByText('Analisis akar masalah selesai!')).toBeInTheDocument();
      
      // Submit button should not be visible anymore
      const submitButton = screen.queryByRole('button', { name: /kirim sebab/i });
      expect(submitButton).not.toBeInTheDocument();
    });
  });
})