import React from 'react'
import { render, fireEvent, act } from '@testing-library/react'
import Navbar from '../../components/navbar/navbar'
import '@testing-library/jest-dom'

const sampleUserData = {
  uuid: '123e4567-e89b-12d3-a456-426614174000',
  date_joined: '2024-04-27T08:00:00Z',
  is_active: true,
  is_staff: true,
  name: 'John Doe',
  email: 'john.doe@gmail.com',
  given_name: 'John',
  family_name: 'Doe',
  picture: 'https://gmail.com/avatar.jpg',
  googleId: '1234567890'
}

const nonStaffUserData = {
  ...sampleUserData,
  is_staff: false
}

describe('Navbar component additional tests', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('handles case when userData is not in localStorage', () => {
    localStorage.setItem('isLoggedIn', 'true');

    const { queryByText } = render(<Navbar />);
    
    expect(queryByText('Name')).toBeInTheDocument();
  });

  test('handles case when user is logged in but not staff', () => {
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userData', JSON.stringify(nonStaffUserData));
    
    const { queryByText } = render(<Navbar />);
    
    expect(queryByText('Analisis Publik')).not.toBeInTheDocument();
    expect(queryByText('Riwayat')).toBeInTheDocument();
    expect(queryByText('John Doe')).toBeInTheDocument();
  });

  test('opens and closes dropdown when clicking the dropdown button', () => {
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userData', JSON.stringify(sampleUserData));
    
    const { getByRole, queryByText } = render(<Navbar />);
    const dropdownButton = getByRole('button', { name: /John Doe/i });

    fireEvent.click(dropdownButton);
    expect(queryByText('Sign out')).toBeInTheDocument();
    
    fireEvent.click(dropdownButton);
    expect(queryByText('Sign out')).not.toBeInTheDocument();
  });

  test('toggles menu open and closed for logged-in users on mobile', () => {
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userData', JSON.stringify(sampleUserData));
    
    const { container } = render(<Navbar />);
    const menuButton = container.querySelector('button[aria-controls="navbar-dropdown"]');
    expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    
    if (menuButton) {
      fireEvent.click(menuButton);
    }

    expect(menuButton).toHaveAttribute('aria-expanded', 'true');
   
    if (menuButton) {
      fireEvent.click(menuButton);
    }

    expect(menuButton).toHaveAttribute('aria-expanded', 'false');
  });

  test('toggles menu open and closed for non-logged-in users on mobile', () => {
    localStorage.setItem('isLoggedIn', 'false');
    
    const { container } = render(<Navbar />);
    const menuButton = container.querySelector('button[aria-controls="navbar-dropdown"]');
    expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    
    if (menuButton) {
      fireEvent.click(menuButton);
    }
    
    expect(menuButton).toHaveAttribute('aria-expanded', 'true');
    
    if (menuButton) {
      fireEvent.click(menuButton);
    }

    expect(menuButton).toHaveAttribute('aria-expanded', 'false');
  });

  test('initializes from localStorage correctly on mount', () => {
    localStorage.setItem('isLoggedIn', 'false');
    
    const { rerender, queryByText } = render(<Navbar />);
    expect(queryByText('Riwayat')).not.toBeInTheDocument();
    
    rerender(<></>);
    
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userData', JSON.stringify(sampleUserData));
    
    rerender(<Navbar />);
    
    expect(queryByText('Analisis Publik')).toBeInTheDocument();
  });
});