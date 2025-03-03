import { CustomInput } from '../customInput'
import React, { useState } from 'react'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'

const CreateLanding = () => {
  const [question, setQuestion] = useState<string>('')
  const router = useRouter()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!question) {
      toast.error('Pertanyaan harus diisi')
      return
    }

    router.push({
      pathname: '/validator',
      query: { question: question }
    })
  }

  return (
    <div className='flex flex-col lg:flex-row justify-between items-center gap-12 lg:mx-48'>
      <div className=''>
        <img src='/icons/landing-icon.svg' alt='landing' className='' />
      </div>
      <div className=''>
          <div className='flex flex-col items-center justify-center gap-4 lg:gap-12'>
            <h1 className='text-3xl font-bold text-center'>Apa masalah yang ingin dianalisis hari ini?</h1>
            <div className='flex flex-row gap-2'>
              <form className='flex flex-row w-full gap-x-4 items-center justify-center' onSubmit={handleSubmit}>
                <CustomInput
                  inputClassName='p-6 text-sm w-[450px] border border-black-300 rounded-lg shadow-md focus:shadow-lg transition-shadow duration-200'
                  placeholder='ingin menganalisis apa hari ini ...'
                  spacerClassName='space-y-0'
                  isDisabled={false}
                  onChange={(e) => setQuestion(e.target.value)}
                  value={question}
                />
                <button className='' title='submit_button'>
                  <img src='/icons/send-icon.svg' alt='search' className='bg-yellow-400 p-3 w-20 h-15 rounded-full' />
                </button>
              </form>
            </div>
          </div>
      </div>
    </div>
  )
}

export default CreateLanding