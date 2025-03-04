import React from 'react'

const Index = () => {
  return (
    <div className="bg-cover bg-center h-full flex text-black bg-[url('/img/intro_header.png')]">
      <div className='bg-white bg-opacity-90 mt-80 py-6 px-16 lg:py-12 lg:px-36'>
        <h1 className='font-bold text-xl mb-4'>MAAMS by Ari Harsono: Metode Analisis Akar Masalah dan Solusi</h1>
        <p className='text-md'>
          Metode untuk menelusuri sebab-musabab paling awal/dalam suatu masalah dan memberikan solusi yang mendasar
          (terutama keadaan bermasalah yang akan dipulihkan atau dinormalkan, bukan dilipatgandakan). Aplikasi ini
          berfokus pada <span className='font-bold'>validasi sebab-sebab masalah</span> yang dimasukkan oleh pengguna.
          Dengan menggunakan algoritma analisis, MAAMS akan memeriksa dan mengonfirmasi sebab-sebab yang mungkin
          mendasari masalah tersebut. Melalui proses ini, MAAMS membantu pengguna untuk menemukan akar dari masalah
          dengan lebih tepat.
        </p>
      </div>
    </div>
  )
}

export default Index