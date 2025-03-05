import React, { useState } from 'react'
import { ConfirmationPopupProps } from '../types/confirmation'
import Mode from '../../constants/mode'

const Dialog: React.FC<{ isOpen: boolean; onClose: () => void; children: React.ReactNode }> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center' onClick={onClose}>
      <div className='bg-white p-6 rounded-lg shadow-lg' onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}

const Button: React.FC<{ onClick: () => void; variant?: 'outline' | 'gradient'; children: React.ReactNode }> = ({
  onClick,
  variant = 'outline',
  children,
}) => {
  const baseClass = 'px-4 py-2 rounded-md font-semibold'
  const variantClass = variant === 'gradient' ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' : 'border border-gray-400 text-gray-700'

  return (
    <button onClick={onClick} className={`${baseClass} ${variantClass}`}>
      {children}
    </button>
  )
}

const ConfirmationPopup: React.FC<ConfirmationPopupProps> = ({ mode, onConfirm, onCancel }) => {
  const [isOpen, setIsOpen] = useState(true)

  const handleConfirm = () => {
    onConfirm()
    setIsOpen(false)
  }

  const handleCancel = () => {
    onCancel()
    setIsOpen(false)
  }

  const getMessage = () => {
    return mode === Mode.pengawasan
      ? 'Apakah Anda yakin ingin menampilkan analisis ini kepada Admin?'
      : 'Ubah analisis menjadi pribadi?'
  }

  return (
    <Dialog isOpen={isOpen} onClose={handleCancel}>
      <h2 className='text-xl font-bold mb-4'>{getMessage()}</h2>
      <div className='flex justify-end gap-4'>
        <Button variant='outline' onClick={handleCancel}>
          Batal
        </Button>
        <Button variant='gradient' onClick={handleConfirm}>
          Simpan
        </Button>
      </div>
    </Dialog>
  )
}

export default ConfirmationPopup
