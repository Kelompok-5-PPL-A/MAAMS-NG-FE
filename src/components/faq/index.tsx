import React, { useState } from 'react'

const FAQ = () => {
  const [openQuestions, setOpenQuestions] = useState<string[]>([])

  const faqData = [
    {
      question: 'Apa itu MAAMS?',
      answer:
        'Dengan menggunakan algoritma analisis, MAAMS akan memeriksa dan mengonfirmasi sebab-sebab utama dan akar permasalahan dari setiap gangguan belajar yang mungkin terjadi. Membantu guru dan orang tua untuk mengintervensi dan memberikan bantuan lebih awal sebelum gangguan belajar menghambat keberhasilan akademis.',
    },
    {
      question: 'Apa perbedaan Pribadi dan Pengawasan?',
      answer:
        'Answer 2',
    },
    {
      question: 'Mengapa MAAMS itu penting?',
      answer:
        'Answer 3.',
    },
  ]

  const toggleAnswer = (question: string) => {
    setOpenQuestions((prevState) => {
      if (prevState.includes(question)) {
        return prevState.filter((q) => q !== question)
      } else {
        return [...prevState, question]
      }
    })
  }  

  return (
    <div>
      {faqData.map((item) => (
        <div key={item.question}>
          <button onClick={() => toggleAnswer(item.question)}>
            {item.question}
          </button>
          {openQuestions.includes(item.question) && (
            <p>{item.answer}</p>
          )}
        </div>
      ))}
    </div>
  )
}

export default FAQ