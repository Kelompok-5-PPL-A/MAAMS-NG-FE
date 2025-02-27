import React from 'react'

const Footer = () => {
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

  return (
    <footer className="bg-gray-800 text-white py-6">
      <div className="container mx-auto text-center">
        <img src="/icons/maams-footer.svg" alt="MAAMS Logo" className="mx-auto mb-4" />
        <p className="text-xl">Developed by:</p>
        {developers.map((developer, index) => (
          <p key={index} className="text-sm">{developer}</p>
        ))}
        <p className="mt-4 text-lg">
          <strong>Researcher:</strong> Ari Harsono
        </p>
      </div>
    </footer>
  )
}

export default Footer