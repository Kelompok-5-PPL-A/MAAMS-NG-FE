import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import ListItem from '../../components/itemListHistory'
import '@testing-library/jest-dom'

jest.mock('../../services/axiosInstance', () => ({
  delete: jest.fn()
}))
jest.mock('next/router', () => ({
  reload: jest.fn(),
  push: jest.fn(),
  useRouter: jest.fn().mockReturnValue({ pathname: '/test-pathname' })
}))

describe('ListItem Component', () => {
  test('renders with required props', () => {
    const props = {
      title: 'Test Title',
      timestamp: '2024-04-05',
      mode: 'Test Mode',
      user: 'Test User',
      idQuestion: '12345'
    }
    const { getByText } = render(<ListItem {...props} />)

    expect(getByText(props.title)).toBeInTheDocument()
    expect(getByText(props.timestamp)).toBeInTheDocument()
    expect(getByText(props.mode)).toBeInTheDocument()
  })

  test('renders without ModeButton when showModeButton is false', () => {
    const props = {
      title: 'Test Title',
      timestamp: '2024-04-05',
      mode: 'Test Mode',
      user: 'Test User',
      idQuestion: '12345',
      showModeButton: false
    }
    const { queryByTestId } = render(<ListItem {...props} />)

    expect(queryByTestId('mode-button')).toBeNull()
  })

  test('renders with DeleteButton when showDeleteButton is true', async () => {
    const props = {
      title: 'Test Title',
      timestamp: '2024-04-05',
      mode: 'Test Mode',
      user: 'Test User',
      idQuestion: '12345',
      showDeleteButton: true
    }
    const { getByTestId, getByText } = render(<ListItem {...props} />)

    fireEvent.click(getByTestId('toggle-open-button'))
    fireEvent.click(getByTestId('delete-button'))
    expect(getByText('Apakah Anda yakin ingin menghapus analisis ini?')).toBeInTheDocument()
    fireEvent.click(getByText('Hapus'))
  })

  test('renders without DeleteButton when showDeleteButton is false', () => {
    const props = {
      title: 'Test Title',
      timestamp: '2024-04-05',
      mode: 'Test Mode',
      user: 'Test User',
      idQuestion: '12345',
      showDeleteButton: false
    }
    const { queryByText } = render(<ListItem {...props} />)

    expect(queryByText('Hapus')).toBeNull()
  })
})
