import React from 'react'
import { render } from '@testing-library/react'
import Footer from '../../components/footer/footer'
import '@testing-library/jest-dom'

describe('Footer Component', () => {
  test('renders footer with correct content', () => {
    const { getByAltText, getByText } = render(<Footer />)

    // Check if MAAMS Logo is rendered with correct alt text
    const maamsLogo = getByAltText('MAAMS Logo')
    expect(maamsLogo).toBeInTheDocument()

    // Check if researcher name is rendered
    const researcherName = getByText('Ari Harsono')
    expect(researcherName).toBeInTheDocument()

    // Check if developers' names are rendered
    const developers = [
      'Muhammad Hilal Darul Fauzan',
      'Steven Faustin Orginata',
      'Ryandhika Al Afzal',
      'Arya Lesmana',
      'Fikri Dhiya Ramadhana',
      'Lidwina Eurora Firsta Nobella',
      'Ariana Nurlayla Syabandini',
      'Nicholas Sidharta',
      'Adly Renadi Raksanagara',
      'Raditya Aditama',
      'Naila Shafirni Hidayat',
      'Rania Maharani Narendra',
      'Bagas Shalahuddin Wahid',
      'Rayhan Putra Randi'
    ]

    developers.forEach((devName) => {
      const developer = getByText(devName)
      expect(developer).toBeInTheDocument()
    })
  })
})