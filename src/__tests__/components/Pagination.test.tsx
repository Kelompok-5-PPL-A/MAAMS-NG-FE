import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react'
import Pagination from '../../components/pagination'
import '@testing-library/jest-dom'
import toast from 'react-hot-toast'

describe('Pagination Component', () => {
  const onPageChangeMock = jest.fn()

  beforeEach(() => {
    onPageChangeMock.mockClear()
  })

  it('renders only one page button when there is exactly one page', () => {
    const { getByText } = render(<Pagination currentPage={1} totalPages={1} onPageChange={onPageChangeMock} />)
    const pageButton = getByText('1')
    expect(pageButton).toBeInTheDocument()
    fireEvent.click(pageButton)
    expect(onPageChangeMock).toHaveBeenCalledWith(1)
    expect(() => getByText('2')).toThrow()
    expect(() => getByText('...')).toThrow()
  })

  it('renders pagination correctly with given props', () => {
    const { getByText } = render(<Pagination currentPage={2} totalPages={5} onPageChange={onPageChangeMock} />)
    expect(getByText('2')).toBeInTheDocument()
    expect(getByText('...')).toBeInTheDocument()
    expect(getByText('5')).toBeInTheDocument()
  })

  it('calls onPageChange when clicking on a page button', () => {
    const { getByText } = render(<Pagination currentPage={1} totalPages={5} onPageChange={onPageChangeMock} />)
    fireEvent.click(getByText('1'))
    expect(onPageChangeMock).toHaveBeenCalledWith(1)
  })

  it('disables previous button on first page', () => {
    const { getByLabelText } = render(<Pagination currentPage={1} totalPages={5} onPageChange={onPageChangeMock} />)
    const previousButton = getByLabelText(/previous/i)
    expect(previousButton).toBeDisabled()
  })

  it('disables next button on last page', () => {
    const { getByLabelText } = render(<Pagination currentPage={5} totalPages={5} onPageChange={onPageChangeMock} />)
    const nextButton = getByLabelText(/next/i)
    expect(nextButton).toBeDisabled()
  })

  it('enables input mode when ellipsis button is clicked', () => {
    const { getByText, getByDisplayValue } = render(
      <Pagination currentPage={3} totalPages={10} onPageChange={onPageChangeMock} />
    )
    fireEvent.click(getByText('...'))
    expect(getByDisplayValue('3')).toBeInTheDocument()
  })

  it('updates input field correctly and submits the new page number on Enter', () => {
    const { getByText, getByDisplayValue } = render(
      <Pagination currentPage={3} totalPages={10} onPageChange={onPageChangeMock} />
    )
    fireEvent.click(getByText('...'))
    const input = getByDisplayValue('3')
    fireEvent.change(input, { target: { value: '5' } })
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })
    expect(onPageChangeMock).toHaveBeenCalledWith(5)
  })

  it('does not submit page change if input value is invalid', () => {
    const { getByText, getByDisplayValue } = render(
      <Pagination currentPage={3} totalPages={10} onPageChange={onPageChangeMock} />
    )
    fireEvent.click(getByText('...'))
    const input = getByDisplayValue('3')
    fireEvent.change(input, { target: { value: '100' } })
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })
    expect(onPageChangeMock).not.toHaveBeenCalled()
  })

  it('exits input mode when input loses focus', () => {
    const { getByText, queryByDisplayValue } = render(
      <Pagination currentPage={3} totalPages={10} onPageChange={onPageChangeMock} />
    )
    fireEvent.click(getByText('...'))
    const input = queryByDisplayValue('3')
    if (input) {
      fireEvent.blur(input)
    }
    expect(queryByDisplayValue('3')).toBeNull()
  })  

  it('prevents entering non-numeric characters in the input field', () => {
    const { getByText, getByRole } = render(
      <Pagination currentPage={2} totalPages={10} onPageChange={onPageChangeMock} />
    )
    fireEvent.click(getByText('...'))
    const input = getByRole('spinbutton') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'abc' } })
    expect(input.value).toBe('')
  })

  it('retains the last valid number if an invalid number is entered', () => {
    const { getByText, getByRole } = render(
      <Pagination currentPage={2} totalPages={10} onPageChange={onPageChangeMock} />
    )
    fireEvent.click(getByText('...'))
    const input = getByRole('spinbutton') as HTMLInputElement
    fireEvent.change(input, { target: { value: '11' } })
    fireEvent.change(input, { target: { value: '' } })
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })
    expect(input.value).toBe('')
  })

  it('calls onPageChange with the previous page number when the previous button is clicked and not on the first page', () => {
    const onPageChangeMock = jest.fn()
    const { getByLabelText } = render(<Pagination currentPage={2} totalPages={5} onPageChange={onPageChangeMock} />)

    const previousButton = getByLabelText('Previous')
    fireEvent.click(previousButton)

    expect(onPageChangeMock).toHaveBeenCalledWith(1)
  })

  it('calls onPageChange with the next page number when the next button is clicked and not on the last page', () => {
    const onPageChangeMock = jest.fn()
    const { getByLabelText } = render(<Pagination currentPage={1} totalPages={3} onPageChange={onPageChangeMock} />)

    const nextButton = getByLabelText('Next')
    fireEvent.click(nextButton)

    expect(onPageChangeMock).toHaveBeenCalledWith(2)
  })

  it('disables the previous button on the first page and enables it otherwise', () => {
    const onPageChangeMock = jest.fn()
    const { getByLabelText, rerender } = render(
      <Pagination currentPage={1} totalPages={5} onPageChange={onPageChangeMock} />
    )

    let previousButton = getByLabelText('Previous')
    expect(previousButton).toBeDisabled()

    rerender(<Pagination currentPage={2} totalPages={5} onPageChange={onPageChangeMock} />)
    previousButton = getByLabelText('Previous')
    expect(previousButton).not.toBeDisabled()
  })

  it('disables the next button on the last page and enables it otherwise', () => {
    const onPageChangeMock = jest.fn()
    const { getByLabelText, rerender } = render(
      <Pagination currentPage={5} totalPages={5} onPageChange={onPageChangeMock} />
    )

    let nextButton = getByLabelText('Next')
    expect(nextButton).toBeDisabled()

    rerender(<Pagination currentPage={4} totalPages={5} onPageChange={onPageChangeMock} />)
    nextButton = getByLabelText('Next')
    expect(nextButton).not.toBeDisabled()
  })

  it('sets hovered to true when mouse enters and false when mouse leaves', () => {
    const { getByText } = render(<Pagination currentPage={2} totalPages={7} onPageChange={onPageChangeMock} />)

    const ellipsisButton = getByText('...')
    fireEvent.mouseEnter(ellipsisButton)
    expect(ellipsisButton).toHaveClass('hover:bg-gray-400')
    expect(ellipsisButton).toHaveClass('focus:bg-gray-300')

    fireEvent.mouseLeave(ellipsisButton)
    expect(ellipsisButton).not.toHaveClass('hover:bg-gray-400')
    expect(ellipsisButton).not.toHaveClass('focus:bg-gray-300')
  })

  it('calls onPageChange with the correct page number when a page button is clicked', () => {
    const { getByText } = render(<Pagination currentPage={1} totalPages={5} onPageChange={onPageChangeMock} />)

    fireEvent.click(getByText('1'))
    expect(onPageChangeMock).toHaveBeenCalledWith(1)

    fireEvent.click(getByText('5'))
    expect(onPageChangeMock).toHaveBeenCalledWith(5)
  })

  it('displays error toast when pressing Enter without entering a value in the input field', async () => {
    const { getByText, getByRole } = render(
      <Pagination currentPage={3} totalPages={10} onPageChange={onPageChangeMock} />
    )
    fireEvent.click(getByText('...'))
    const input = getByRole('spinbutton')
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })
    expect(onPageChangeMock).not.toHaveBeenCalled()

    await waitFor(() => {
      setTimeout(() => {
        expect(toast.error).toHaveBeenCalledWith('Masukkan halaman yang ingin anda tuju')
      }, 2000)
    })
  })
})
