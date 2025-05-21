import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Navbar from '../../components/navbar/navbar';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
  signOut: jest.fn()
}));

// Mock next/router
jest.mock('next/router', () => ({
  useRouter: jest.fn()
}));

describe('Navbar Component', () => {
  const mockRouter = {
    push: jest.fn(),
    pathname: '/'
  };

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    localStorage.clear();
  });

  // Positive Cases
  describe('Positive Cases', () => {
    it('renders correctly for unauthenticated users', () => {
      (useSession as jest.Mock).mockReturnValue({
        data: null,
        status: 'unauthenticated'
      });

      render(<Navbar />);
      expect(screen.getByText('Login')).toBeInTheDocument();
      expect(screen.getByText('Tambahkan Analisis')).toBeInTheDocument();
    });

    it('renders correctly for authenticated users', () => {
      (useSession as jest.Mock).mockReturnValue({
        data: {
          user: {
            email: 'test@example.com',
            username: 'testuser',
            role: 'user'
          }
        },
        status: 'authenticated'
      });

      render(<Navbar />);
      expect(screen.getByText('testuser')).toBeInTheDocument();
      expect(screen.getByText('Riwayat')).toBeInTheDocument();
    });

    it('shows admin menu for admin users', () => {
      (useSession as jest.Mock).mockReturnValue({
        data: {
          user: {
            email: 'admin@example.com',
            username: 'admin',
            role: 'admin'
          }
        },
        status: 'authenticated'
      });

      render(<Navbar />);
      expect(screen.getByText('Analisis Publik')).toBeInTheDocument();
    });
  });

  // Negative Cases
  describe('Negative Cases', () => {
    it('handles missing user data gracefully', () => {
      (useSession as jest.Mock).mockReturnValue({
        data: {
          user: null
        },
        status: 'authenticated'
      });

      render(<Navbar />);
      expect(screen.getByText('User')).toBeInTheDocument();
    });

    it('handles missing role gracefully', () => {
      (useSession as jest.Mock).mockReturnValue({
        data: {
          user: {
            email: 'test@example.com',
            username: 'testuser'
          }
        },
        status: 'authenticated'
      });

      render(<Navbar />);
      expect(screen.queryByText('Analisis Publik')).not.toBeInTheDocument();
    });
  });

  // Edge Cases
  describe('Edge Cases', () => {
    it('handles empty username', () => {
      (useSession as jest.Mock).mockReturnValue({
        data: {
          user: {
            email: 'test@example.com',
            username: '',
            role: 'user'
          }
        },
        status: 'authenticated'
      });

      render(<Navbar />);
      expect(screen.getByText('User')).toBeInTheDocument();
    });

    it('handles very long username', () => {
      const longUsername = 'a'.repeat(100);
      (useSession as jest.Mock).mockReturnValue({
        data: {
          user: {
            email: 'test@example.com',
            username: longUsername,
            role: 'user'
          }
        },
        status: 'authenticated'
      });

      render(<Navbar />);
      expect(screen.getByText(longUsername)).toBeInTheDocument();
    });

    it('handles session loading state', () => {
      (useSession as jest.Mock).mockReturnValue({
        data: null,
        status: 'loading'
      });

      render(<Navbar />);
      expect(screen.getByText('Login')).toBeInTheDocument();
    });
  });
});