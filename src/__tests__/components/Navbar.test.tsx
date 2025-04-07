import React from 'react'
import { render, fireEvent, act, screen } from '@testing-library/react'
import Navbar from '../../components/navbar/navbar'
import '@testing-library/jest-dom'
import { signOut } from 'next-auth/react'

// Mock dependencies
jest.mock('react-hot-toast', () => ({
  error: jest.fn()
}))

jest.mock('next-auth/react', () => ({
  signOut: jest.fn(() => Promise.resolve())
}))

// Setup mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    })
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

const sampleUserData = {
  uuid: '123e4567-e89b-12d3-a456-426614174000',
  date_joined: '2024-04-27T08:00:00Z',
  is_active: true,
  role: 'staff',
  email: 'john.doe@gmail.com',
  username: 'johndoe',
  first_name: 'John',
  last_name: 'Doe',
  npm: '1234567890',
  angkatan: '2020'
};

const nonStaffUserData = {
  ...sampleUserData,
  role: 'mahasiswa'
};

describe('Navbar component', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('renders correctly when userData is not in localStorage', () => {
    localStorage.setItem('isLoggedIn', 'true');

    render(<Navbar />);

    expect(screen.queryByText('Riwayat')).toBeInTheDocument();
  });


  test('opens and closes dropdown when clicking the dropdown button', () => {
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userData', JSON.stringify(sampleUserData));

    render(<Navbar />);
    const dropdownButton = screen.getByRole('button', { name: /John/i });

    fireEvent.click(dropdownButton);
    expect(screen.queryByText('Sign out')).toBeInTheDocument();

    fireEvent.click(dropdownButton);
    expect(screen.queryByText('Sign out')).not.toBeInTheDocument();
  });

  test('toggles menu for logged-in users on mobile', () => {
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userData', JSON.stringify(sampleUserData));

    render(<Navbar />);
    const menuButton = screen.getByRole('button', { name: '' });

    expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(menuButton);
    expect(menuButton).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(menuButton);
    expect(menuButton).toHaveAttribute('aria-expanded', 'false');
  });

  test('toggles menu for non-logged-in users on mobile', () => {
    localStorage.setItem('isLoggedIn', 'false');

    render(<Navbar />);
    const menuButton = screen.getByRole('button', { name: '' });

    expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(menuButton);
    expect(menuButton).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(menuButton);
    expect(menuButton).toHaveAttribute('aria-expanded', 'false');
  });

  test('signs out and clears localStorage on logout', async () => {
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userData', JSON.stringify(sampleUserData));

    Object.defineProperty(window, 'location', {
      value: { href: '' },
      writable: true,
    });

    render(<Navbar />);
    const dropdownButton = screen.getByRole('button', { name: /John/i });
    fireEvent.click(dropdownButton);
    const signOutButton = screen.getByText('Sign out');

    await act(async () => {
      fireEvent.click(signOutButton);
    });

    expect(signOut).toHaveBeenCalled();
    expect(localStorage.clear).toHaveBeenCalled();
    expect(window.location.href).toBe('/');
  });
});
