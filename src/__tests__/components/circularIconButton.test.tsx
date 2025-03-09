import '@testing-library/jest-dom'
import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import { CircularIconButton } from '../../components/circularIconButton'

describe('CircularIconButton Component', () => {
  test('renders button with provided icon', () => {
    const { getByTestId } = render(<CircularIconButton icon='Test Icon' onClick={() => {}} type='button' />)
    const buttonElement = getByTestId('submit-question')
    expect(buttonElement).toBeInTheDocument()
    expect(buttonElement).toHaveTextContent('Test Icon')
  })

  test('calls onClick function when button is clicked', () => {
    const handleClick = jest.fn()
    const { getByTestId } = render(<CircularIconButton icon='Test Icon' onClick={handleClick} type='button' />)
    const buttonElement = getByTestId('submit-question')
    fireEvent.click(buttonElement)
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  test('renders button with correct type attribute', () => {
    const { getByTestId } = render(<CircularIconButton icon='Test Icon' onClick={() => {}} type='submit' />)
    const buttonElement = getByTestId('submit-question')
    expect(buttonElement).toHaveAttribute('type', 'submit')
  })
})
