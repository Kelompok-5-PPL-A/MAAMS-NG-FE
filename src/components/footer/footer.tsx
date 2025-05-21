import React from 'react'
import Image from 'next/image'

const DeveloperList = ({ developers }: { developers: string[] }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-y-2 gap-x-4">
      <div>
        {developers.slice(0, 7).map((developer) => (
          <div key={developer}>{developer}</div>
        ))}
      </div>
      <div>
        {developers.slice(7).map((developer) => (
          <div key={developer}>{developer}</div>
        ))}
      </div>
    </div>
  )
}

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
    <footer className="bg-black flex flex-col lg:flex-row justify-between p-16">
      <Image src="/icons/maams-footer.svg" className="max-w-48" alt="MAAMS Logo" width={192} height={48} />
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-32 justify-between text-white mt-8 lg:mt-0">
        <div>
          <div className="font-bold mb-4">Researcher</div>
          <div>Ari Harsono</div>
        </div>
        <div>
          <div className="font-bold mb-4">Developers</div>
          <DeveloperList developers={developers} />
        </div>
      </div>
    </footer>
  )
}

export default Footer