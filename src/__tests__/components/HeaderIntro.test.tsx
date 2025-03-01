import React from 'react'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom'
import HeaderIntro from '../../components/headerIntro/index'

describe('Index component', () => {
  test('renders correctly', () => {
    const { getByText } = render(<HeaderIntro />)

    const titleElement = getByText(/MAAMS by Ari Harsono/i)
    expect(titleElement).toBeInTheDocument()

    const descriptionElement = getByText(/Metode untuk menelusuri sebab-musabab paling awal/i)
    expect(descriptionElement).toBeInTheDocument()
  })
})