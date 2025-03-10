import React, { useEffect, useState } from 'react'
import MainLayout from '@/layout/MainLayout'
import { DropdownMode } from '@/components/dropdownMode'
import Mode from '../../constants/mode'
import toast from 'react-hot-toast'
import { useRouter } from 'next/router'
import { CustomInput } from '@/components/customInput'
import { Badge } from '@/badges'
import ConfirmationPopup from '@/components/confirmationPopup'

const QuestionAddPage: React.FC = () => {
  const router = useRouter()

  const [mode, setMode] = useState<Mode>(Mode.pribadi)
  const [title, setTitle] = useState<string>('')
  const [question, setQuestion] = useState<string>('')
  const [newTag, setNewTag] = useState<string>('')
  const [isLoading] = useState<boolean>(false)
  const [tags, setTags] = useState<string[]>([])
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false)
  const [selectedMode, setSelectedMode] = useState<Mode>(mode)

  useEffect(() => {
    if (router.query.question) {
      setQuestion(router.query.question as string)
    }
  }, [router.query])

  const handleModeChange = (newMode: Mode) => {
    if (newMode !== mode) {
      setSelectedMode(newMode)
      setShowConfirmation(true)
    }
  }

  const handleConfirmModeChange = () => {
    setMode(selectedMode)
    setShowConfirmation(false)
  }

  const handleCancelModeChange = () => {
    setSelectedMode(mode)
    setShowConfirmation(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newTag.trim() !== '') {
      if (tags.length == 3) {
        toast.error('Kategori sudah ada 3')
        return
      }
      if (newTag.length > 10) {
        toast.error('Kategori maksimal 10 karakter.')
        return
      }
      if (tags.includes(newTag.trim())) {
        toast.error('Kategori sudah ada. Masukan kategori lain')
        return
      }
      setTags((prevCategories) => [...prevCategories, newTag.trim()])
      setNewTag('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  return (
    <MainLayout>
      {showConfirmation && (
        <ConfirmationPopup
          mode={selectedMode}
          onConfirm={handleConfirmModeChange}
          onCancel={handleCancelModeChange}
        />
      )}
      <div className='min-h-screen m-10 my-20'>
        <div className='flex flex-col w-full'>
          <div className='w-full'>
            <DropdownMode selectedMode={selectedMode} onChange={handleModeChange} />
          </div>
          <h1 className='text-2xl font-bold text-black my-8'>Ingin menganalisis masalah apa hari ini?</h1>
          <div className='flex flex-col lg:justify-center lg:w-full gap-4'>
            <div className='flex flex-col lg:justify-center lg:w-full gap-2'>
              <div>Judul Analisis</div>
              <CustomInput
                value={title}
                placeholder='Ingin menganalisis apa hari ini ...'
                onChange={(e) => setTitle(e.target.value)}
              ></CustomInput>
            </div>
            <div className='flex flex-col lg:justify-center lg:w-full gap-2'>
              <div>Pertanyaan (akibat)</div>
              <CustomInput
                value={question}
                placeholder='Pertanyaan apa yang ingin ditanyakan ...'
                onChange={(e) => setQuestion(e.target.value)}
              ></CustomInput>
            </div>
            <div className='flex flex-col lg:justify-center lg:w-full gap-2'>
              <div>Kategori Analisis</div>
              <CustomInput
                value={newTag}
                placeholder='Berikan maksimal 3 kategori ...'
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={handleKeyDown}
              ></CustomInput>
              <div className='flex flex-wrap gap-2'>
                {tags.map((tag) => (
                  <div key={tag}>
                    <Badge text={tag} isRemovable={true} handleRemove={() => handleRemoveTag(tag)}></Badge>
                  </div>
                ))}
              </div>
            </div>
            <div className='flex justify-center w-full flex-col lg:flex-row'>
              <button
                type='button'
                // onClick={handleSubmit}
                className='bg-gradient-to-b from-yellow-400 to-yellow-600 text-l text-white font-bold py-2 px-12 rounded-xl w-[192px] mx-auto'
                disabled={isLoading}
              >
                Kirim
              </button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

export default QuestionAddPage