import React from 'react'
import { render, fireEvent } from '@testing-library/react'
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

describe('Navbar component', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  test('renders correctly when user is logged in', () => {
    localStorage.setItem('isLoggedIn', 'true')
    localStorage.setItem('userData', JSON.stringify(sampleUserData))

    const { getByText } = render(<Navbar />)

    expect(getByText('Riwayat')).toBeInTheDocument()
    expect(getByText('John Doe')).toBeInTheDocument()
    expect(getByText('Tambahkan Analisis')).toBeInTheDocument()
  })

  test('renders correctly when user is not logged in', () => {
    localStorage.setItem('isLoggedIn', 'false')

    const { getByText, queryByText } = render(<Navbar />)

    expect(queryByText('Riwayat')).toBeNull()
    expect(getByText('Login')).toBeInTheDocument()
  })

  test('toggles menu when menu button is clicked on mobile layout', async () => {
    global.innerWidth = 480

    const { container } = render(<Navbar />)

    const menuButton = container.querySelector(
      'button[aria-controls="navbar-dropdown"][aria-expanded="false"][class="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"]'
    )

    if (menuButton) {
      fireEvent.click(menuButton)
    }

    expect(menuButton).toHaveAttribute('aria-expanded', 'true')

    global.innerWidth = 1096
  })

  test('toggles dropdown when dropdown button is clicked', () => {
    localStorage.setItem('isLoggedIn', 'true')
    localStorage.setItem('userData', JSON.stringify(sampleUserData))

    const { getByRole } = render(<Navbar />)

    const dropdownButton = getByRole('button', { name: /John Doe/i })
    fireEvent.click(dropdownButton)
  })

  test('renders Analisis Publik button when user is logged in and is_staff', () => {
    localStorage.setItem('isLoggedIn', 'true')
    localStorage.setItem('userData', JSON.stringify(sampleUserData))
    const { getByText } = render(<Navbar />);

    expect(getByText('Analisis Publik')).toBeInTheDocument();
  });

  test('does not render Analisis Publik button when user is not logged in', () => {
    localStorage.setItem('isLoggedIn', 'false')
    const { queryByText } = render(<Navbar />)
  
    expect(queryByText('Analisis Publik')).toBeNull()
  })
})