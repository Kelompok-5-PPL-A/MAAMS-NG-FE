import { BiPencil } from 'react-icons/bi'
import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import axiosInstance from '../../services/axiosInstance'
import { MdSend } from 'react-icons/md'
import { CircularIconButton } from '../../components/circularIconButton'
import { Icon } from '@chakra-ui/react'
import { useOnClickOutside } from 'usehooks-ts'
import { HiOutlineInformationCircle } from 'react-icons/hi'
import { useSession } from 'next-auth/react'

export const EditableTitleForm: React.FC<EditableTitleFormProps> = ({ title, id, onTitleChange }) => {
  const [isEditable, setIsEditable] = useState(false)
  const [newTitle, setNewTitle] = useState(title)
  const [isLoading, setIsLoading] = useState(false)
  const ref = useRef<HTMLFormElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const {data: session} = useSession()

  useEffect(() => {
    setNewTitle(title)
  }, [title])

  useOnClickOutside(ref as React.RefObject<HTMLElement>, () => {
    setIsEditable(false)
  })

  useEffect(() => {
    if (isEditable && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isEditable])

  const handleEditClick = () => {
    setIsEditable(true)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const titleInput = newTitle?.trim()

    if (!titleInput) {
      toast.error('Judul tidak boleh kosong')
      setIsEditable(false)
      setNewTitle(title)
      return
    }
    if (titleInput === title) {
      toast('Judul sama dengan sebelumnya', {
        icon: <HiOutlineInformationCircle className='text-blue-500 w-6 h-6' />
      })
      setIsEditable(false)
      setNewTitle(title)
      return
    }
    if (titleInput.length > 40) {
      toast.error('Batas panjang judul hanya 40 karakter')
      setIsEditable(false)
      setNewTitle(title)
      return
    }

    try {
      setIsLoading(true)
      if (session) {
        await axiosInstance.patch(`/question/ubah/judul/${id}/`, {
          title: titleInput
        })
        toast.success('Judul analisis berhasil diubah')
        onTitleChange(titleInput)
      } else {
        await fetch(`${process.env.NEXTAUTH_API_BASE_URL}question/ubah/judul/${id}/`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            title: titleInput
          })
        })
        toast.success('Judul analisis berhasil diubah')
        onTitleChange(titleInput)
      }
    } catch (error: any) {
      if (error.response) {
        toast.error(error.response.data.detail)
      } else {
        toast.error('Gagal mengubah judul analisis')
      }
    } finally {
      setIsEditable(false)
      setIsLoading(false)
    }
  }

  let content;
  if (isLoading) {
    content = <span>Saving...</span>;
  } else {
    content = (
      <form ref={ref} className='flex flex-row gap-4' onSubmit={handleSubmit}>
        <input
          data-testid='input-title'
          ref={inputRef}
          className='p-2 bg-white rounded-[10px] border border-black justify-center items-center gap-2 inline-flex w-full'
          type='text'
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
        />
        <CircularIconButton icon={<Icon as={MdSend} />} type='submit' />
      </form>
    );
  }

  return (
    <>
      {!isEditable ? (
        <div className='flex flex-row w-full items-start gap-2'>
          <h1 className='text-2xl font-bold text-black overflow-y-hidden'>{newTitle}</h1>
          <button onClick={handleEditClick} className='py-2 justify-start' type='button' data-testid='edit-title'>
            <BiPencil className='w-6 h-6' />
          </button>
        </div>
      ) : (
        content
      )}
    </>
  )
}
