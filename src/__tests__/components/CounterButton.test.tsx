import '@testing-library/jest-dom'
import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import { CounterButton } from '../../components/counterButton'

describe('CounterButton Component', () => {
  test('renders with the given number', () => {
    const number = 3
    const onIncrement = jest.fn()
    const onDecrement = jest.fn()

    const { getByText } = render(<CounterButton number={number} onIncrement={onIncrement} onDecrement={onDecrement} />)
    expect(getByText(number.toString())).toBeInTheDocument()
  })

  test('calls onIncrement when the "+" button is clicked', () => {
    const onIncrement = jest.fn()
    const onDecrement = jest.fn()

    const { getByText } = render(<CounterButton number={3} onIncrement={onIncrement} onDecrement={onDecrement} />)

    fireEvent.click(getByText('+'))
    expect(onIncrement).toHaveBeenCalled()
  })

  test('calls onDecrement when the "-" button is clicked', () => {
    const onIncrement = jest.fn()
    const onDecrement = jest.fn()

    const { getByText } = render(<CounterButton number={3} onIncrement={onIncrement} onDecrement={onDecrement} />)

    fireEvent.click(getByText('-'))
    expect(onDecrement).toHaveBeenCalled()
  })

  test('does not render with a negative number', () => {
    const onIncrement = jest.fn()
    const onDecrement = jest.fn()

    const { queryByText } = render(<CounterButton number={-1} onIncrement={onIncrement} onDecrement={onDecrement} />)
    expect(queryByText((content, element) => content === '-1' && !element?.className.includes('text-black'))).toBeNull()
  })

  test('renders with default styles and border color when number is 4', () => {
    const { getByText } = render(<CounterButton number={4} onIncrement={() => {}} onDecrement={() => {}} />)

    const incrementButton = getByText('+')
    const decrementButton = getByText('-')

    expect(incrementButton).toHaveClass('text-[#fbc707]')
    expect(decrementButton).toHaveClass('text-[#fbc707]')
    expect(incrementButton.parentElement).toHaveClass('border-[#fbc707]')
    expect(decrementButton.parentElement).toHaveClass('border-[#fbc707]')
  })

  test('renders with disabled styles and border color when number is 3', () => {
    const { getByText } = render(<CounterButton number={3} onIncrement={() => {}} onDecrement={() => {}} />)

    const incrementButton = getByText('+')
    const decrementButton = getByText('-')

    expect(incrementButton).toHaveClass('text-[#fbc707]')
    expect(decrementButton).toHaveClass('text-[#aeaeae]')
    expect(incrementButton.parentElement).toHaveClass('border-[#fbc707]')
    expect(decrementButton.parentElement).toHaveClass('border-[#aeaeae]')
  })

  test('renders with disabled styles and border color when number is 5', () => {
    const { getByText } = render(<CounterButton number={5} onIncrement={() => {}} onDecrement={() => {}} />)

    const incrementButton = getByText('+')
    const decrementButton = getByText('-')

    expect(incrementButton).toHaveClass('text-[#aeaeae]')
    expect(decrementButton).toHaveClass('text-[#fbc707]')
    expect(incrementButton.parentElement).toHaveClass('border-[#aeaeae]')
    expect(decrementButton.parentElement).toHaveClass('border-[#fbc707]')
  })

  test('does not have incorrect styles when number is 4', () => {
    const { getByText } = render(<CounterButton number={4} onIncrement={() => {}} onDecrement={() => {}} />)

    const incrementButton = getByText('+')
    const decrementButton = getByText('-')

    expect(incrementButton).not.toHaveClass('text-red-500')
    expect(decrementButton).not.toHaveClass('text-red-500')
  })

  test('renders correctly with number 0', () => {
    const { getByText } = render(<CounterButton number={0} onIncrement={() => {}} onDecrement={() => {}} />)
    expect(getByText('0')).toBeInTheDocument()
  })

  test('matches snapshot', () => {
    const { asFragment } = render(<CounterButton number={3} onIncrement={() => {}} onDecrement={() => {}} />)
    expect(asFragment()).toMatchSnapshot()
  })
})
