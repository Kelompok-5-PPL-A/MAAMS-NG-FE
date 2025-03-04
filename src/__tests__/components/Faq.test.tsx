import { render, fireEvent } from '@testing-library/react'
import FAQ from '../../components/faq'
import React from 'react'
import '@testing-library/jest-dom'

describe('FAQ component', () => {
  it('renders FAQ questions correctly', () => {
    const { getByText } = render(<FAQ />)

    const question1 = getByText('Apa itu MAAMS?')
    expect(question1).toBeInTheDocument()

    const question2 = getByText('Apa perbedaan Pribadi dan Pengawasan?')
    expect(question2).toBeInTheDocument()

    const question3 = getByText('Mengapa MAAMS itu penting?')
    expect(question3).toBeInTheDocument()
  })

  it('toggles answers on click', () => {
    const { getByText, queryByText } = render(<FAQ />)

    const question1 = getByText('Apa itu MAAMS?')
    fireEvent.click(question1)

    const answer1PartialText =
      /Dengan menggunakan algoritma analisis, MAAMS akan memeriksa dan mengonfirmasi sebab-sebab /
    const answer1 = getByText(answer1PartialText)
    expect(answer1).toBeInTheDocument()

    fireEvent.click(question1)
    expect(queryByText(answer1PartialText)).not.toBeInTheDocument()
  })
})