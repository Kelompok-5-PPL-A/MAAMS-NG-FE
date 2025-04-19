import React from 'react';
import { render, fireEvent, screen, act } from '@testing-library/react';
import Navbar from '../../components/navbar/navbar';
import '@testing-library/jest-dom';
import { SessionProvider, signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

// Mocks
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('next-auth/react', () => {
  const actual = jest.requireActual('next-auth/react');
  return {
    ...actual,
    useSession: jest.fn(),
    signOut: jest.fn(() => Promise.resolve()),
  };
});

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  })
) as jest.Mock;

// Helper to render within <SessionProvider>
const renderWithSession = (ui: React.ReactElement) => {
  return render(<SessionProvider>{ui}</SessionProvider>);
};

// Sample users
const userData = {
  uuid: '123',
  username: 'johndoe',
  email: 'john@example.com',
  role: 'staff',
};

// Mocks for localStorage
beforeAll(() => {
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
      }),
    };
  })();
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
  });
});

describe('Navbar Component', () => {
  const push = jest.fn();
  let windowLocation: Location;

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push });
    
    // Save original window.location
    windowLocation = window.location;
    
    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: {
        ...window.location,
        href: '',
      },
      writable: true,
    });
  });

  afterEach(() => {
    // Restore original window.location
    Object.defineProperty(window, 'location', {
      value: windowLocation,
      writable: true,
    });
  });

  test('renders correctly for unauthenticated users', () => {
    (useSession as jest.Mock).mockReturnValue({ data: null, status: 'unauthenticated' });

    renderWithSession(<Navbar />);

    expect(screen.getByText(/Login/i)).toBeInTheDocument();
    expect(screen.getByText(/Tambahkan Analisis/i)).toBeInTheDocument();
  });

  test('renders correctly for authenticated users', () => {
    (useSession as jest.Mock).mockReturnValue({
      data: { user: userData },
      status: 'authenticated',
    });

    renderWithSession(<Navbar />);

    expect(screen.getByText(/Riwayat/i)).toBeInTheDocument();
    expect(screen.getByText(/Analisis Publik/i)).toBeInTheDocument();
    expect(screen.getByText(/johndoe/i)).toBeInTheDocument();
  });

  test('toggles mobile menu', () => {
    (useSession as jest.Mock).mockReturnValue({
      data: { user: userData },
      status: 'authenticated',
    });

    renderWithSession(<Navbar />);
    const menuButton = screen.getByRole('button', { name: '' });

    expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(menuButton);
    expect(menuButton).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(menuButton);
    expect(menuButton).toHaveAttribute('aria-expanded', 'false');
  });

  test('opens and closes user dropdown menu', () => {
    (useSession as jest.Mock).mockReturnValue({
      data: { user: userData },
      status: 'authenticated',
    });

    renderWithSession(<Navbar />);
    const dropdownButton = screen.getByRole('button', { name: /johndoe/i });

    fireEvent.click(dropdownButton);
    expect(screen.getByText(/Sign out/i)).toBeInTheDocument();

    fireEvent.click(dropdownButton);
    expect(screen.queryByText(/Sign out/i)).not.toBeInTheDocument();
  });

  test('logs out and redirects normal user to home', async () => {
    (useSession as jest.Mock).mockReturnValue({
      data: { user: userData },
      status: 'authenticated',
    });

    localStorage.setItem('loginMethod', 'google');

    renderWithSession(<Navbar />);
    fireEvent.click(screen.getByRole('button', { name: /johndoe/i }));
    const signOutButton = screen.getByText(/Sign out/i);

    await act(async () => {
      fireEvent.click(signOutButton);
    });

    expect(signOut).toHaveBeenCalledWith({ redirect: false });
    expect(localStorage.clear).toHaveBeenCalled();
    expect(push).toHaveBeenCalledWith('/');
  });

  test('logs out and redirects SSO user to CAS logout', async () => {
    (useSession as jest.Mock).mockReturnValue({
      data: { user: userData },
      status: 'authenticated',
    });

    localStorage.setItem('loginMethod', 'sso');

    renderWithSession(<Navbar />);
    fireEvent.click(screen.getByRole('button', { name: /johndoe/i }));
    const signOutButton = screen.getByText(/Sign out/i);

    await act(async () => {
      fireEvent.click(signOutButton);
    });

    expect(signOut).toHaveBeenCalledWith({ redirect: false });
    expect(localStorage.clear).toHaveBeenCalled();
    expect(window.location.href).toContain('https://sso.ui.ac.id/cas2/logout');
  });
});