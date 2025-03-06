import React, { useEffect, useState } from 'react'
import MainLayout from '@/layout/MainLayout'
import { DropdownMode } from '@/components/dropdownMode'
import Mode from '../../constants/mode'
import toast from 'react-hot-toast'
import { useRouter } from 'next/router'
import { CustomInput } from '@/components/customInput'
import { Badge } from '@/badges'
import axiosInstance from '../../services/axiosInstance'

const QuestionAddPage: React.FC = () => {
  const router = useRouter()

  const [mode, setMode] = useState<Mode>(Mode.pribadi)
  const [title, setTitle] = useState<string>('')
  const [question, setQuestion] = useState<string>('')
  const [newTag, setNewTag] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [tags, setTags] = useState<string[]>([])

  useEffect(() => {
    if (router.query.question) {
      setQuestion(router.query.question as string)
    }
  }, [router.query])

  const handleModeChange = (newMode: Mode) => {
    setMode(newMode)
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
  
  const handleSubmit = async () => {
    setIsLoading(true)
    if (!title) {
      toast.error('Judul harus diisi')
      setIsLoading(false)
      return
    } else if (!question) {
      toast.error('Pertanyaan harus diisi')
      setIsLoading(false)
      return
    } else if (tags.length == 0) {
      toast.error('Minimal mengisi 1 kategori')
      setIsLoading(false)
      return
    } else if (title.length > 40) {
      toast.error('Judul maksimal 40 karakter. Berikan judul yang lebih singkat')
      setIsLoading(false)
      return
    }

    try {
      const { data } = await axiosInstance.post('/api/baru/', {
        title: title,
        question: question,
        mode: mode,
        tags: tags
      })
      if(data) {
        toast.success('Analisis berhasil ditambahkan')
      }
      // router.push(`/validator/${data.id}`)
    } catch (error: any) {
      if (error.response) {
        toast.error(error.response.data.detail)
        setIsLoading(false)
      } else {
        toast.error('Gagal menambahkan analisis')
        setIsLoading(false)
      }
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  return (
    <MainLayout>
      <div className='min-h-screen m-10'>
        <div className='flex flex-col w-full'>
          <div className='w-full'>
            <DropdownMode selectedMode={mode} onChange={handleModeChange} />
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
                onClick={handleSubmit}
                className='bg-gradient-to-b from-yellow-400 to-yellow-600 text-l text-white font-bold py-2 px-12 rounded-xl'
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