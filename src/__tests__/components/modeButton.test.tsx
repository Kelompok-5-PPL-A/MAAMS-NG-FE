import React from 'react'
import { render } from '@testing-library/react'
import ModeButton from '../../components/modeButton'
import '@testing-library/jest-dom'

describe('ModeButton', () => {
  it('renders with the provided mode', () => {
    const mode = 'Test Mode'
    const { getByText } = render(<ModeButton mode={mode} />)
    const buttonElement = getByText(mode)
    expect(buttonElement).toBeInTheDocument()
  })
})
