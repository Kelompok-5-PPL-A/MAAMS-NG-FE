import { ValidatorQuestionFormProps } from '../types/validatorQuestionFormProps'
import Mode from '../../constants/mode'
import { DropdownMode } from '../dropdownMode'
import { CustomInput } from '../customInput'
import { CircularIconButton } from '../circularIconButton'
import React, { useState, useEffect } from 'react'
import { MdSend } from 'react-icons/md'
import toast from 'react-hot-toast'
import { useRouter } from 'next/router'
import { DeleteButton } from '../../components/deleteButton'
import { Icon, Modal, ModalOverlay, ModalContent, ModalFooter, ModalBody, ModalCloseButton } from '@chakra-ui/react'
import axiosInstance from '../../services/axiosInstance'
import { EditableTitleForm } from '../../components/editableTitleForm'
import { TagsGroup } from '../../components/tagsGroup'
import { BiPencil } from 'react-icons/bi'
import { Badge } from '../../badges'
import { HiOutlineInformationCircle } from 'react-icons/hi'
import { useSession } from 'next-auth/react'

export const ValidatorQuestionForm: React.FC<ValidatorQuestionFormProps> = ({ id, validatorData }) => {
  const [question, setQuestion] = useState<string>(validatorData?.question ?? '')
  const [mode, setMode] = useState<Mode | undefined>(validatorData?.mode || Mode.pribadi)
  const router = useRouter()
  const [isModeChangeModalOpen, setIsModeChangeModalOpen] = useState<boolean>(false)
  const [pendingMode, setPendingMode] = useState(mode)
  const [title, setTitle] = useState<string | undefined>(validatorData?.title ?? validatorData?.question)
  const [isTagsChangeModalOpen, setIsTagsChangeModalOpen] = useState<boolean>(false)
  const [tags, setTags] = useState<string[]>([])
  const [tagsModal, setTagsModal] = useState<string[]>([]);
  const [newTag, setNewTag] = useState<string>('')
  const {data: session} = useSession()

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle)
  }

  const handleTagsReset = () => {
    setTagsModal(tags)
    setIsTagsChangeModalOpen(false)
  }

  const handleModeChange = (newMode: Mode) => {
    setPendingMode(newMode)
    setIsModeChangeModalOpen(true)
  }

  useEffect(() => {
    if (validatorData?.mode !== mode) {
      setMode(validatorData?.mode ?? Mode.pribadi)
    }
    setTitle(validatorData?.title ?? validatorData?.question)
    setTags(validatorData?.tags ?? [])
    setTagsModal(validatorData?.tags ?? [])
  }, [validatorData])

  const handleModeChangeConfirm = async () => {
    try {
      if (session) {
        if (!id) {
          setMode(validatorData?.mode || pendingMode)
        } else {
          if (session) {
            const { data } = await axiosInstance.patch(`api/v1/question/ubah/${id}/`, {
              mode: pendingMode
            })
            setMode(data.mode)
          } else {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}api/v1/question/ubah/${id}/`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                mode: pendingMode
              })
            })
            const res = { data: await response.json()};
            setMode(res.data.mode)
          }
        }
        setIsModeChangeModalOpen(false)
        toast.success('Berhasil mengubah mode')
      } else {
        toast.error('Gagal mengubah mode. Pastikan anda sudah login')
      }
    } catch (error: any) {
      if (error.response) {
        toast.error(error.response.data.detail)
      } else {
        toast.error('Gagal mengubah mode')
      }
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!question) {
      toast.error('Pertanyaan harus diisi')
      return
    }

    try {
      if (session) {
        const { data } = await axiosInstance.post('api/v1/question/submit/', {
          mode: mode,
          question: question
        })
        toast.success('Analisis berhasil ditambahkan')
        router.push(`/validator/${data.id}`)
      } else {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}api/v1/question/submit/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            mode: mode,
            question: question
          })
        })
        const res = { data: await response.json()};
        toast.success('Analisis berhasil ditambahkan')
        router.push(`/validator/${res.data.id}`)
      }
    } catch (error: any) {
      if (error.response) {
        toast.error(error.response.data.detail)
      } else {
        toast.error('Gagal menambahkan analisis')
      }
    }
  }

  const handleTagsChangeConfirm = async () => {
    if (arraysAreEqual(tagsModal, validatorData?.tags)) {
      toast('Kategori sama dengan sebelumnya', {
        icon: <HiOutlineInformationCircle className='text-blue-500 w-6 h-6' />
      })
      return
    }
  
    if (tagsModal?.length == 0) {
      toast.error('Minimal mengisi 1 kategori')
      return
    }
    
    try {
      if (session) {
        const { data } = await axiosInstance.patch(`api/v1/question/ubah/tags/${id}/`, {
          tags: tagsModal
        })
        setTags(data.tags)
        setTagsModal(data.tags)
        setIsTagsChangeModalOpen(false)
        toast.success('Berhasil mengubah kategori')
      } else {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}api/v1/question/ubah/tags/${id}/`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            tags: tagsModal
          })
        })
        const res = { data: await response.json()};
        setTags(res.data.tags)
        setTagsModal(res.data.tags)
        setIsTagsChangeModalOpen(false)
        toast.success('Berhasil mengubah kategori')
      }
    } catch (error: any) {
      if (error.response) {
        toast.error(error.response.data.detail)
      } else {
        toast.error('Gagal mengubah kategori')
      }
    }
  }
  

  const arraysAreEqual = (arr1: string[] | undefined, arr2: string[] | undefined) => {
    if (!Array.isArray(arr1) || !Array.isArray(arr2)) return false; // Ensure both are valid arrays
    if (arr1.length !== arr2.length) return false; // Length check

    const sortedArr1 = [...arr1].sort((a, b) => a.localeCompare(b));
    const sortedArr2 = [...arr2].sort((a, b) => a.localeCompare(b));

    return sortedArr1.every((value, index) => value === sortedArr2[index]);
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (newTag.trim() === '') {
        toast.error('Kategori harus diisi')
        return
      }
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
      setTagsModal((prevCategories) => [...prevCategories, newTag.trim()])
      setNewTag('')
    }
  }  

  const handleRemoveTag = (tagToRemove: string) => {
    setTagsModal(tagsModal?.filter((tag) => tag !== tagToRemove))
  }

  return (
    <div className='flex flex-col w-full gap-8'>
      <div className='flex flex-row'>
        <div className='w-full'>
          <DropdownMode selectedMode={isModeChangeModalOpen ? pendingMode : mode} onChange={handleModeChange} />
        </div>
        {id && <DeleteButton idQuestion={id} pathname={router.pathname} />}
      </div>
  
      {id && <EditableTitleForm title={title} onTitleChange={handleTitleChange} id={id} />}
  
      <div className='flex flex-col gap-2'>
        <h2 className='text-md'>Kategori Analisis:</h2>
        <div className='flex flex-row gap-2'>
          <TagsGroup tags={tags} />
          <button
            className='rounded-full px-3 py-1 flex items-center bg-amber-500 radius-xl flex-row gap-1 hover:bg-amber-400'
            onClick={() => setIsTagsChangeModalOpen(!isTagsChangeModalOpen)}
            data-testid='toggle-tags-button'
          >
            <BiPencil className='h-6' />
            Ubah Kategori
          </button>
        </div>
      </div>
  
      <form onSubmit={handleSubmit} data-testid='question-form'>
        <div className='w-full'>
          <div className='flex gap-4'>
            <CustomInput
              inputClassName='flex-grow w-full py-7 p-6 bg-white rounded-[10px] shadow border border-zinc-500 justify-start items-center gap-4 inline-flex'
              placeholder='Isi pertanyaan anda di sini'
              value={id ? validatorData?.question : question}
              isDisabled={!!id}
              onChange={(e) => setQuestion(e.target.value)}
            />
            {!id && (
              <CircularIconButton icon={<Icon as={MdSend} />} type='submit' data-testid='submit-question' />
            )}
          </div>
        </div>
      </form>
  
      <Modal isOpen={isModeChangeModalOpen} onClose={() => setIsModeChangeModalOpen(false)}>
        <ModalOverlay />
        <ModalContent className='py-8'>
          <ModalCloseButton />
          <ModalBody className='items-center mt-8 mx-4 text-center text-xl font-bold'>
            {pendingMode === Mode.pengawasan
              ? 'Apakah Anda yakin ingin menampilkan analisis ini kepada Admin?'
              : 'Ubah analisis menjadi pribadi?'}
          </ModalBody>
          <ModalFooter>
            <div className='w-full flex flex-row gap-4'>
              <button
                className='w-full px-6 py-2 border-2 border-yellow-400 rounded-2xl text-black text-lg'
                onClick={() => setIsModeChangeModalOpen(false)}
              >
                Batal
              </button>
              <button
                className='w-full px-6 py-2 bg-gradient-to-t from-yellow-500 to-yellow-500 text-white rounded-2xl gap-2 inline-flex'
                onClick={handleModeChangeConfirm}
              >
                Simpan
              </button>
            </div>
          </ModalFooter>
        </ModalContent>
      </Modal>
  
      <Modal size='xl' isOpen={isTagsChangeModalOpen} onClose={handleTagsReset}>
        <ModalOverlay />
        <ModalContent className='py-8'>
          <ModalCloseButton />
          <ModalBody className='items-center mt-8'>
            <div className='flex flex-col lg:justify-center lg:w-full gap-2'>
              <div className='font-bold'>Kategori Analisis</div>
              <CustomInput
                value={newTag}
                placeholder='Berikan maksimal 3 kategori ...'
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <div className='flex flex-wrap gap-2'>
                {tagsModal?.map((tag) => (
                  <Badge key={tag} text={tag} isRemovable handleRemove={() => handleRemoveTag(tag)} />
                ))}
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <div className='flex flex-row gap-4'>
              <button
                className='w-full px-6 py-2 border-2 border-yellow-400 rounded-2xl text-black text-lg'
                onClick={handleTagsReset}
              >
                Batal
              </button>
              <button
                className='w-full px-6 py-2 bg-gradient-to-t from-yellow-500 to-yellow-500 text-white rounded-2xl gap-2 inline-flex'
                onClick={handleTagsChangeConfirm}
              >
                Kirim
              </button>
            </div>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
}  