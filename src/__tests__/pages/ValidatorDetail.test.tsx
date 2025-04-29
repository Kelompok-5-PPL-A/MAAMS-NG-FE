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
    render(<WrappedValidatorDetailPage />);
    
    // Check that the page renders initially
    expect(screen.getByText('Sebab:')).toBeInTheDocument();
    
    // Wait for data to load
    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith('/question/123');
      expect(mockedAxios.get).toHaveBeenCalledWith('/cause/123/');
    });
  });

  test('renders validator page with CounterButton and initial Row', async () => {
    render(<WrappedValidatorDetailPage />);
    
    // Check for necessary UI elements
    expect(screen.getByText('Sebab:')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    
    // Check the rows are rendered
    await waitFor(() => {
      const rowContainers = screen.getAllByTestId('row-container');
      expect(rowContainers.length).toBeGreaterThanOrEqual(1);
    });
  });

  test('adjusting column count updates all rows', async () => {
    render(<WrappedValidatorDetailPage />);
    
    // Initially has 3 columns
    expect(screen.getByText('3')).toBeInTheDocument();
    
    // Click increment button to add a column
    fireEvent.click(screen.getByRole('button', { name: '+' }));
    
    // Column count should update to 4
    expect(screen.getByText('4')).toBeInTheDocument();
    
    // Check number of inputs has increased
    await waitFor(() => {
      const inputs = screen.getAllByRole('textbox');
      expect(inputs.length).toBeGreaterThan(3);
    });
  });

  test('should increment and decrement column count correctly', async () => {
    render(<WrappedValidatorDetailPage />);
    
    // Initial state: 3 columns
    expect(screen.getByText('3')).toBeInTheDocument();
    
    // Testing increment
    const incrementButton = screen.getByRole('button', { name: '+' });
    fireEvent.click(incrementButton);
    expect(screen.getByText('4')).toBeInTheDocument();
    
    // Testing decrement
    const decrementButton = screen.getByRole('button', { name: '-' });
    fireEvent.click(decrementButton);
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  test('does not allow incrementing beyond 5 columns', async () => {
    render(<WrappedValidatorDetailPage />);
    
    const incrementButton = screen.getByRole('button', { name: '+' });
    
    // Click increment button multiple times
    for (let i = 0; i < 5; i++) {
      fireEvent.click(incrementButton);
    }
    
    // Should stop at 5
    expect(screen.getByText('5')).toBeInTheDocument();
    
    // Try clicking more times
    fireEvent.click(incrementButton);
    fireEvent.click(incrementButton);
    
    // Should still be 5
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  test('does not allow decrementing below 3 columns', async () => {
    render(<WrappedValidatorDetailPage />);
    
    const decrementButton = screen.getByRole('button', { name: '-' });
    
    // Click decrement button multiple times
    for (let i = 0; i < 5; i++) {
      fireEvent.click(decrementButton);
    }
    
    // Should stop at 3
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  test('prevents submitting if causes are empty', async () => {
    // Mock empty causes data
    mockedAxios.get.mockImplementation((url) => {
      if (url.includes('/cause/')) {
        return Promise.resolve({ data: [] });
      }
      return Promise.resolve({ data: mockValidatorData });
    });
    
    render(<WrappedValidatorDetailPage />);
    
    await waitFor(() => {
      const submitButton = screen.getByRole('button', { name: 'Kirim Sebab' });
      expect(submitButton).toBeDisabled();
    });
  });

  test('submits causes successfully', async () => {
    const user = userEvent.setup(); // Setup userEvent
    // Mocks (sudah benar)
    mockedAxios.get.mockImplementation(/*...*/);
    mockedAxios.patch.mockResolvedValue({ data: mockCausesData });

    render(<WrappedValidatorDetailPage />);

    // Tunggu data & temukan input cause pertama yang benar
    const firstCauseInput = await screen.findByDisplayValue('First Cause');

    // Masukkan perubahan (dalam act)
    await act(async () => {
      await user.type(firstCauseInput, ' additional text'); // Tambahkan teks
    });

    // Tunggu tombol submit menjadi enabled
    const submitButton = screen.getByRole('button', { name: 'Kirim Sebab' });
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled(); // Tunggu sampai tidak disabled
    });

    // Klik submit (dalam act)
    await act(async () => {
      await user.click(submitButton); // Gunakan userEvent untuk klik
    });

    // Cek API call dan toast
    await waitFor(() => {
      // Patch validasi harus dipanggil
      expect(mockedAxios.patch).toHaveBeenCalledWith('/cause/validate/123/');
      // Jika patch validasi di atas juga memicu patch spesifik, cek itu juga
      // expect(mockedAxios.patch).toHaveBeenCalledWith(`/cause/patch/123/cause1/`, expect.any(Object));
      expect(mockToastSuccess).toHaveBeenCalled(); // Gunakan referensi mock yg benar
    });
  });

  test('handles API error when getting question data', async () => {
    // Mock API error
    mockedAxios.get.mockImplementationOnce((url) => {
      if (url.includes('/question/')) {
        return Promise.reject(new Error('API Error'));
      }
      return Promise.resolve({ data: {} });
    });
    
    render(<WrappedValidatorDetailPage />);
    
    // Wait for error handling
    await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith('Gagal mengambil data analisis');
        expect(mockPush).toHaveBeenCalledWith('/');
      });
  });

  test('handles API error when getting causes data', async () => {
    // Mock causes API error
    mockedAxios.get.mockImplementation((url) => {
      if (url.includes('/question/')) {
        return Promise.resolve({ data: mockValidatorData });
      } else if (url.includes('/cause/')) {
        return Promise.reject(new Error('Failed to fetch causes'));
      }
      return Promise.resolve({ data: {} });
    });
    
    render(<WrappedValidatorDetailPage />);
    
    // Wait for error handling
    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('Gagal mengambil sebab');
    });
  });

  test('handles user input in causes fields', async () => {
    const user = userEvent.setup();
    render(<WrappedValidatorDetailPage />);

    // Tunggu & temukan input berdasarkan value awal dari mockCausesData[0]
    const firstCauseInput = await screen.findByDisplayValue('First Cause');

    // Lakukan interaksi pada elemen yang benar
    await act(async () => {
      // Verifikasi nilai awal sebelum diubah
      expect(firstCauseInput).toHaveValue('First Cause');
      await user.clear(firstCauseInput);
      await user.type(firstCauseInput, 'New test cause');
    });

    // Verifikasi nilai akhir
    expect(firstCauseInput).toHaveValue('New test cause');
  });

  // Terapkan pola `waitFor(() => expect(submitButton).not.toBeDisabled())`
  // yang sama untuk 'adds row when valid row is submitted'
  test('adds row when valid row is submitted', async () => {
    const user = userEvent.setup();
    const mockExtendedCauses = [/*...*/]; // Definisikan
     // Make sure extendedCauses is defined correctly
    const mockExtendedCausesData = [ // Beri nama beda agar jelas
        ...mockCausesData,
        {
          id: 'cause4',
          problem: 'Problem 1',
          column: 0,
          row: 2, // New row
          mode: 'pribadi',
          cause: 'Follow-up Cause',
          status: true,
          root_status: false,
          feedback: '',
        }
      ];

    // Mocks
    mockedAxios.get.mockImplementation((url) => {
      if (url.includes('/question/')) return Promise.resolve({ data: mockValidatorData });
      if (url.includes('/cause/')) return Promise.resolve({ data: mockCausesData }); // Initial
      return Promise.resolve({ data: {} });
    });
    mockedAxios.patch.mockResolvedValueOnce({ data: {} }); // Validation response

    render(<WrappedValidatorDetailPage />);
    const firstCauseInput = await screen.findByDisplayValue('First Cause');

    // Masukkan perubahan
    await act(async () => {
      await user.type(firstCauseInput, ' (modified)');
    });

    // Tunggu tombol aktif
    const submitButton = screen.getByRole('button', { name: 'Kirim Sebab' });
    await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
    });

    // Klik submit
    await act(async () => {
      await user.click(submitButton);
    });

    // Tunggu validasi dipanggil
    await waitFor(() => {
      expect(mockedAxios.patch).toHaveBeenCalledWith('/cause/validate/123/');
    });

    // Mock GET *kedua* untuk data baru
    mockedAxios.get.mockImplementation((url) => {
      if (url.includes('/question/')) return Promise.resolve({ data: mockValidatorData });
      // Kembalikan data baru saat dipanggil lagi setelah validasi
      if (url.includes('/cause/')) return Promise.resolve({ data: mockExtendedCausesData });
      return Promise.resolve({ data: {} });
    });

     // Tunggu UI update dan verifikasi baris baru
     await waitFor(() => {
        expect(screen.getByText('Follow-up Cause')).toBeInTheDocument();
        // Atau periksa jumlah baris
        const rowContainers = screen.getAllByTestId('row-container');
        expect(rowContainers.length).toBe(2); // Sesuaikan jika logika berbeda
      });

     // Cek total panggilan GET
     expect(mockedAxios.get).toHaveBeenCalledTimes(3); // Initial(Q+C) + After Validation(C)
  });

  // Terapkan pola yang sama untuk test error submit/validation
  // Pastikan tombol submit diaktifkan dulu sebelum diklik
  test('handles API error when submitting causes', async () => {
    const user = userEvent.setup();
    // Mock error untuk PATCH validasi
    mockedAxios.patch.mockRejectedValueOnce({
        response: { data: { detail: 'Invalid cause' } }
      });

    render(<WrappedValidatorDetailPage />);
    const firstCauseInput = await screen.findByDisplayValue('First Cause');

    // Aktifkan tombol
    await act(async () => {
        await user.type(firstCauseInput, ' Test cause');
    });
    const submitButton = screen.getByRole('button', { name: 'Kirim Sebab' });
    await waitFor(() => { // Tunggu aktif
        expect(submitButton).not.toBeDisabled();
    });

    // Klik submit
    await act(async () => {
        await user.click(submitButton);
    });

    // Cek hasil
    await waitFor(() => {
      expect(mockedAxios.patch).toHaveBeenCalledWith('/cause/validate/123/');
      expect(mockToastError).toHaveBeenCalledWith('Gagal validasi sebab: Invalid cause');
    });
  });

   test('handles validation error', async () => {
      const user = userEvent.setup();
      // Mock error PATCH validasi
      mockedAxios.patch.mockRejectedValueOnce(new Error('Validation failed'));

      render(<WrappedValidatorDetailPage />);
      const firstCauseInput = await screen.findByDisplayValue('First Cause');

      // Aktifkan tombol
      await act(async () => {
         await user.type(firstCauseInput, ' Test cause');
      });
      const submitButton = screen.getByRole('button', { name: 'Kirim Sebab' });
      await waitFor(() => { // Tunggu aktif
         expect(submitButton).not.toBeDisabled();
      });

      // Klik submit
      await act(async () => {
         await user.click(submitButton);
      });

      // Cek hasil
      await waitFor(() => {
         expect(mockedAxios.patch).toHaveBeenCalledWith('/cause/validate/123/');
         expect(mockToastError).toHaveBeenCalledWith('Gagal validasi sebab');
         // Cek GET dipanggil lagi untuk refresh setelah error
         expect(mockedAxios.get).toHaveBeenCalledWith('/cause/123/');
         expect(mockedAxios.get).toHaveBeenCalledTimes(3); // Initial Q+C, After Error C
      });
    });

  test('correctly handles root causes and completion state', async () => {
    // Mock data with root causes in all columns
    const rootCausesData = [
      {
        id: 'cause1',
        problem: 'Problem 1',
        column: 0,
        row: 1,
        mode: 'pribadi',
        cause: 'First Cause',
        status: true,
        root_status: true,
        feedback: 'Root cause found',
      },
      {
        id: 'cause2',
        problem: 'Problem 1',
        column: 1,
        row: 1,
        mode: 'pribadi',
        cause: 'Second Cause',
        status: true,
        root_status: true,
        feedback: 'Root cause found',
      },
      {
        id: 'cause3',
        problem: 'Problem 1',
        column: 2,
        row: 1,
        mode: 'pribadi',
        cause: 'Third Cause',
        status: true,
        root_status: true,
        feedback: 'Root cause found',
      },
    ];
    
    // Return complete data after validation
    mockedAxios.get.mockImplementation((url) => {
      if (url.includes('/question/')) {
        return Promise.resolve({ data: mockValidatorData });
      } else if (url.includes('/cause/')) {
        return Promise.resolve({ data: rootCausesData });
      }
      return Promise.resolve({ data: {} });
    });
    
    render(<WrappedValidatorDetailPage />);
    
    // Wait for data to load and completion to be detected
    await waitFor(() => {
      expect(screen.getByText('Analisis akar masalah selesai!')).toBeInTheDocument();
    });
    
    // Submit button should not be visible when complete
    expect(screen.queryByRole('button', { name: 'Kirim Sebab' })).not.toBeInTheDocument();
  });

  test('handles patch for existing rows', async () => {
    const user = userEvent.setup();
    // Mock data (seperti sebelumnya)
    const mockExistingCauses = [/*...*/];
     const mockExistingCausesData = [ // Beri nama beda agar jelas
         {
           id: 'cause1',
           problem: 'Problem 1',
           column: 0,
           row: 1,
           mode: 'pribadi',
           cause: 'First Cause Existing', // Nilai Awal Berbeda
           status: false,
           root_status: false,
           feedback: 'Needs improvement',
         }
       ];

    mockedAxios.get.mockImplementation((url) => {
      if (url.includes('/question/')) return Promise.resolve({ data: mockValidatorData });
      // Gunakan mock data spesifik untuk test ini
      if (url.includes('/cause/')) return Promise.resolve({ data: mockExistingCausesData });
      return Promise.resolve({ data: {} });
    });
    mockedAxios.patch // Mock patch calls (specific & validate)
        .mockResolvedValueOnce({ data: {} }) // Patch specific
        .mockResolvedValueOnce({ data: {} }); // Patch validate

    render(<WrappedValidatorDetailPage />);

    // Tunggu & temukan input berdasarkan value awalnya
    const inputToPatch = await screen.findByDisplayValue('First Cause Existing');

    // Ubah value (userEvent.clear harusnya bekerja pada textarea/input)
    await act(async () => {
        await user.clear(inputToPatch);
        await user.type(inputToPatch, 'Updated cause');
    });

    // Tunggu tombol submit aktif
    const submitButton = screen.getByRole('button', { name: 'Kirim Sebab' });
    await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
    });

    // Klik submit
    await act(async () => {
        await user.click(submitButton);
    });

    // Assert patch calls
    await waitFor(() => {
      expect(mockedAxios.patch).toHaveBeenCalledWith(
        `/cause/patch/123/${mockExistingCausesData[0].id}/`,
        { cause: 'Updated cause' }
      );
      expect(mockedAxios.patch).toHaveBeenCalledWith('/cause/validate/123/');
      expect(mockToastSuccess).toHaveBeenCalled();
    });
    expect(mockedAxios.patch).toHaveBeenCalledTimes(2);
  });

  test('handles working column progression correctly', async () => {
    const user = userEvent.setup();

    const mockInitialProgressionCauses = [
        { id: 'causeA1', problem: 'P1', column: 0, row: 1, mode: 'pribadi', cause: 'C0R1 Done', status: true, root_status: false, feedback: '', },
        { id: 'causeA2', problem: 'P1', column: 0, row: 2, mode: 'pribadi', cause: 'C0R2 Root', status: true, root_status: true, feedback: 'Root0', }, // Col 0 Complete
        { id: 'causeB1', problem: 'P1', column: 1, row: 1, mode: 'pribadi', cause: 'C1R1 Active', status: false, root_status: false, feedback: '', }, // Target Input
        { id: 'causeC1', problem: 'P1', column: 2, row: 1, mode: 'pribadi', cause: 'C2R1 Locked', status: false, root_status: false, feedback: '', },
      ];
    const mockUpdatedProgressionCauses = [
        ...mockInitialProgressionCauses,
        { id: 'causeB2', problem: 'P1', column: 1, row: 2, mode: 'pribadi', cause: 'C1R2 Root', status: true, root_status: true, feedback: 'Root1', }, // Col 1 Complete
      ];

    // Mock initial GET dengan data ini
    mockedAxios.get.mockImplementation((url) => {
        if (url.includes('/question/')) return Promise.resolve({ data: mockValidatorData });
        if (url.includes('/cause/')) return Promise.resolve({ data: mockInitialProgressionCauses });
        return Promise.resolve({ data: {} });
    });

    render(<WrappedValidatorDetailPage />);

    // Tunggu render awal selesai (cari elemen yang pasti ada)
    await screen.findByText('C0R2 Root');
    // screen.debug(); // Optional: uncomment untuk melihat DOM jika findByDisplayValue gagal

    // Cari input kolom 1 berdasarkan value awalnya
    const col1Input = await screen.findByDisplayValue('C1R1 Active');
    expect(col1Input).not.toBeDisabled(); // Verifikasi tidak disabled

    // Mock PATCH calls (specific for causeB1 & validate)
    mockedAxios.patch
        .mockResolvedValueOnce({ data: {} }) // Patch specific causeB1
        .mockResolvedValueOnce({ data: {} }); // Patch validate

    // Mock GET *setelah* validasi
    mockedAxios.get.mockImplementation((url) => {
       if (url.includes('/question/')) return Promise.resolve({ data: mockValidatorData });
       if (url.includes('/cause/')) return Promise.resolve({ data: mockUpdatedProgressionCauses });
       return Promise.resolve({ data: {} });
     });

    // Ubah input kolom 1
    await act(async () => {
        await user.clear(col1Input);
        await user.type(col1Input, 'Updated C1R1');
    });

    // Tunggu tombol aktif & klik submit
    const submitButton = screen.getByRole('button', { name: 'Kirim Sebab' });
    await waitFor(() => expect(submitButton).not.toBeDisabled());
    await act(async () => { await user.click(submitButton); });

    // Verifikasi panggilan & hasil
    await waitFor(() => {
        expect(mockedAxios.patch).toHaveBeenCalledWith(
            `/cause/patch/123/causeB1/`, // ID dari cause yang diubah
            { cause: 'Updated C1R1' }
        );
        expect(mockedAxios.patch).toHaveBeenCalledWith('/cause/validate/123/');
        expect(mockToastSuccess).toHaveBeenCalled();
    });

    // Verifikasi UI update setelah refetch (misal, cari feedback baru)
    await screen.findByText('Root1');

    expect(mockedAxios.patch).toHaveBeenCalledTimes(2);
    expect(mockedAxios.get).toHaveBeenCalledTimes(3);
  });

  test('shows completion message when all columns are complete', async () => {
    // All columns have root causes
    const completeCauses = [
      {
        id: 'cause1',
        column: 0,
        row: 1,
        mode: 'pribadi',
        cause: 'First Cause',
        status: true,
        root_status: true,
        feedback: 'Root found',
      },
      {
        id: 'cause2',
        column: 1,
        row: 1,
        mode: 'pribadi',
        cause: 'Second Cause',
        status: true,
        root_status: true,
        feedback: 'Root found',
      },
      {
        id: 'cause3',
        column: 2,
        row: 1,
        mode: 'pribadi',
        cause: 'Third Cause',
        status: true,
        root_status: true,
        feedback: 'Root found',
      },
    ];
    
    mockedAxios.get.mockImplementation((url) => {
      if (url.includes('/question/')) {
        return Promise.resolve({ data: mockValidatorData });
      } else if (url.includes('/cause/')) {
        return Promise.resolve({ data: completeCauses });
      }
      return Promise.resolve({ data: {} });
    });
    
    render(<WrappedValidatorDetailPage />);
    
    // Verify completion message is shown
    await waitFor(() => {
      expect(screen.getByText('Analisis akar masalah selesai!')).toBeInTheDocument();
    });
  });
});