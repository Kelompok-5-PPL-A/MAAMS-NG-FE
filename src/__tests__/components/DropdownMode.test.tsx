import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { DropdownMode } from '@/components/dropdownMode'
import Mode from '@/constants/mode'

describe('DropdownMode Component', () => {
  test('renders with initial selected option', () => {
    const selectedMode = Mode.pribadi
    const onChange = jest.fn()
    const { getByText } = render(<DropdownMode selectedMode={selectedMode} onChange={onChange} />)
    expect(getByText(selectedMode)).toBeInTheDocument()
  })

  test('opens and closes dropdown when clicked', () => {
    const selectedMode = Mode.pribadi
    const onChange = jest.fn()
    const { getByText, queryByText } = render(<DropdownMode selectedMode={selectedMode} onChange={onChange} />)
    const dropdownButton = getByText(selectedMode)

    fireEvent.click(dropdownButton)
    expect(queryByText(Mode.pengawasan)).toBeInTheDocument()

    fireEvent.click(dropdownButton)
    expect(queryByText(Mode.pengawasan)).not.toBeInTheDocument()
  })

  test('closes dropdown when clicked outside', () => {
    const selectedMode = Mode.pribadi
    const onChange = jest.fn()
    const { getByText, queryByText } = render(<DropdownMode selectedMode={selectedMode} onChange={onChange} />)
    const dropdownButton = getByText(selectedMode)

    fireEvent.click(dropdownButton)
    expect(queryByText(Mode.pengawasan)).toBeInTheDocument()

    fireEvent.mouseDown(document.body)
    expect(queryByText(Mode.pengawasan)).not.toBeInTheDocument()
  })

  test('calls onChange when option is selected', () => {
    const selectedMode = Mode.pribadi
    const onChange = jest.fn()
    const { getByText } = render(<DropdownMode selectedMode={selectedMode} onChange={onChange} />)
    const optionToSelect = Mode.pengawasan

    fireEvent.click(getByText(selectedMode))
    fireEvent.click(getByText(optionToSelect))

    expect(onChange).toHaveBeenCalledWith(optionToSelect)
  })
})
