import React, { useState } from 'react'

interface FAQItem {
  id: number
  question: string
  answer: string
}

const FAQ: React.FC = () => {
  const [activeIndices, setActiveIndices] = useState<number[]>([])

  const faqData: FAQItem[] = [
    {
      id: 1,
      question: 'Apa itu MAAMS?',
      answer:
        'Aplikasi ini berfokus pada <strong>validasi sebab-sebab masalah</strong> yang dimasukkan oleh pengguna. ' +
        'Dengan menggunakan algoritma analisis, MAAMS akan memeriksa dan mengonfirmasi sebab-sebab ' +
        'yang mungkin mendasari masalah tersebut. Melalui proses ini, MAAMS membantu pengguna ' +
        'untuk menemukan <strong>akar dari masalah</strong> dengan lebih tepat.'
    },
    {
      id: 2,
      question: 'Apa perbedaan Pribadi dan Pengawasan?',
      answer:
        'Perbedaan antara <strong>Pribadi</strong> dan <strong>Pengawasan</strong> adalah mode Pribadi hanya memungkinkan pengguna itu sendiri ' +
        'yang dapat melihat dan mengedit informasi, sedangkan mode Pengawasan ' +
        'memungkinkan pengawas atau administrator untuk mengakses dan memantau data tersebut. ' +
        'Dalam konteks MAAMS, mode Pribadi memastikan privasi data pengguna, sedangkan mode ' +
        'Pengawasan memungkinkan pengawasan untuk memastikan proses validasi berjalan dengan baik.'
    },
    {
      id: 3,
      question: 'Mengapa MAAMS itu penting?',
      answer:
        'MAAMS penting karena aplikasi ini membantu dalam mengidentifikasi dan memvalidasi ' +
        '<strong>akar masalah</strong> dengan lebih akurat. Dengan demikian, pengguna dapat mengambil langkah-langkah ' +
        'yang tepat untuk mengatasi masalah tersebut. Selain itu, fitur pengawasan dalam MAAMS ' +
        'memastikan integritas data dan proses validasi, sehingga meningkatkan kualitas dan ' +
        'keandalan hasil analisis.'
    }
  ]

  const toggleAnswer = (index: number) => {
    setActiveIndices((prevIndices) =>
      prevIndices.includes(index) ? prevIndices.filter((i) => i !== index) : [...prevIndices, index]
    )
  }

  return (
    <div className='flex flex-col justify-center items-center w-full gap-8 px-8 my-8'>
      <p className='text-3xl font-bold text-center text-black'>FAQ</p>
      <div className='w-full'>
        {faqData.map((faq) => (
          <div key={faq.id} className='bg-yellow-200 rounded-md p-6 mb-4 shadow-md border border-yellow-500'>
            <button
              onClick={() => toggleAnswer(faq.id)}
              className='flex justify-between items-center cursor-pointer w-full text-left p-0 border-none bg-transparent'
              aria-expanded={activeIndices.includes(faq.id)}
              aria-controls={`faq-answer-${faq.id}`}
            >
              <p className='text-lg text-black'>
                <strong>{faq.question}</strong>
              </p>
              <svg
                className={`w-6 h-6 transform transition-transform duration-300 ${
                  activeIndices.includes(faq.id) ? 'rotate-180' : ''
                }`}
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
              </svg>
            </button>
            {activeIndices.includes(faq.id) && (
              <>
                <hr className='my-4 border-gray-400' />
                <p className='text-base text-black' dangerouslySetInnerHTML={{ __html: faq.answer }}></p>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default FAQ