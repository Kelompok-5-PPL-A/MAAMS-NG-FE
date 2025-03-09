import React, { useRef, useState } from 'react'
import { useEffect } from 'react'
import { useOnClickOutside } from 'usehooks-ts'
import { HiDotsVertical, HiTrash } from 'react-icons/hi'
import { DeleteButtonProps } from '../types/deleteButtonProps'
import { Modal, ModalOverlay, ModalContent, ModalFooter, ModalBody, ModalCloseButton } from '@chakra-ui/react'
import axiosInstance from '../../services/axiosInstance'
import toast from 'react-hot-toast'
import router from 'next/router'

export const DeleteButton = ({ idQuestion, pathname }: DeleteButtonProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const ref = useRef<HTMLDivElement | null>(null)
  const handleModalDeleteOpen = () => setIsModalDeleteOpen(!isModalDeleteOpen)
  const [isModalDeleteOpen, setIsModalDeleteOpen] = useState<boolean>(false)

  useEffect(() => {
    setIsOpen(false)
  }, [])

  useOnClickOutside(ref as React.RefObject<HTMLElement>, () => {
    setIsOpen(false)
  })

  const handleDelete = async () => {
    try {
      await axiosInstance.delete(`/api/v1/validator/hapus/${idQuestion}/`)
      toast.success('Berhasil menghapus analisis')
      if (pathname === '/history') {
        router.reload()
      } else {
        router.push('/history')
      }
    } catch (error: any) {
      if (error.response) {
        toast.error(error.response.data.detail)
      } else {
        toast.error('Gagal menghapus analisis')
      }
    }
  }

  return (
    <>
      <div className='relative' ref={ref}>
        <div
          onClick={() => setIsOpen(!isOpen)}
          data-testid='toggle-open-button'
          className={`cursor-pointer py-2 text-md font-bold flex items-center justify-between`}
        >
          <button className='w-fit h-fit' type='button'>
            <HiDotsVertical className='w-4 h-4' />
          </button>
          {isOpen && (
            <div
              className='absolute w-[200px] rounded-xl top-8 right-0 mt-2 w-56 bg-slate-100 shadow-lg text-red'
              role='menu'
              aria-orientation='vertical'
              aria-labelledby='options-menu'
            >
              <div className='py-1'>
                <button
                  onClick={handleModalDeleteOpen}
                  className='block px-4 py-4 text-sm cursor-pointer justify-center items-center w-full'
                  data-testid='delete-button'
                >
                  <div className='text-red-600 flex flex-row gap-2 justify-center items-center'>
                    <HiTrash className='w-6 h-6' />
                    <p>Hapus analisis</p>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={isModalDeleteOpen} onClose={handleModalDeleteOpen}>
        <ModalOverlay />
        <ModalContent className='py-8'>
          <ModalCloseButton />
          <ModalBody className='items-center mt-8 mx-4 text-center text-xl font-bold'>
            Apakah Anda yakin ingin menghapus analisis ini?
          </ModalBody>
          <ModalFooter>
            <div className='w-full flex flex-row gap-4'>
              <button
                className='w-full px-6 py-2 border-2 border-yellow-400 rounded-2xl justify-center items-center text-black text-lg'
                onClick={handleModalDeleteOpen}
              >
                Batal
              </button>
              <button
                className='w-full px-6 py-2 bg-gradient-to-t from-red-500 to-red-900 text-white  rounded-2xl justify-center items-center gap-2 inline-flex'
                onClick={handleDelete}
              >
                Hapus
              </button>
            </div>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
