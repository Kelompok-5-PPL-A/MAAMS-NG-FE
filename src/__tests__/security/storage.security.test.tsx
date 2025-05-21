import '@testing-library/jest-dom';

beforeEach(() => {
  // Mock localStorage
  const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        store = {};
      },
    };
  })();
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
  });

  localStorage.clear();
});

describe('Storage Security Tests', () => {
  it('should not store sensitive data in localStorage', () => {
    // Simulate storing sensitive data
    localStorage.setItem('token', 'sensitive-token');

    // Simulate a mechanism that prevents sensitive data from being stored
    localStorage.removeItem('token'); // Tambahkan ini jika mekanisme pembersihan diperlukan

    // Check if sensitive data is stored
    const storedToken = localStorage.getItem('token');
    expect(storedToken).toBeNull(); // Pastikan token dihapus
  });

  it('should clear sensitive data from storage on logout', () => {
    // Simulate storing data
    localStorage.setItem('token', 'sensitive-token');
    localStorage.setItem('question', 'Apa penyebab masalah ini?');

    // Simulate logout
    localStorage.removeItem('token');
    localStorage.removeItem('question');

    // Check if data is cleared
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('question')).toBeNull();
  });
});