import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Badge } from '@/badges'
import React from 'react'

describe('Badge', () => {
  const mockHandleRemove = jest.fn()

  it('should render badge with text', () => {
    render(<Badge text='Test Badge' isRemovable={false} />)

    expect(screen.getByText('Test Badge')).toBeInTheDocument()
  })

  it('should not render remove button if isRemovable is false', () => {
    render(<Badge text='No Remove' isRemovable={false} />)

    expect(screen.queryByTestId('remove-tag-button')).not.toBeInTheDocument()
  })

  it('should render remove button if isRemovable is true', () => {
    render(<Badge text='Removable' isRemovable={true} handleRemove={mockHandleRemove} />)

    expect(screen.getByTestId('remove-tag-button')).toBeInTheDocument()
  })

  it('should call handleRemove when remove button is clicked', () => {
    render(<Badge text='Clickable' isRemovable={true} handleRemove={mockHandleRemove} />)

    const button = screen.getByTestId('remove-tag-button')
    fireEvent.click(button)

    expect(mockHandleRemove).toHaveBeenCalledTimes(1)
  })
})
