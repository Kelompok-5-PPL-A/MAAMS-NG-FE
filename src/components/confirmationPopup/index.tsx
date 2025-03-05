import React, { useState, useEffect } from 'react'
import { ConfirmationPopupProps } from '../types/confirmation'
import Mode from '../../constants/mode'

const Dialog: React.FC<{ isOpen: boolean; onClose: () => void; children: React.ReactNode }> = ({ isOpen, onClose, children }) => {
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose()
        }
      }
      if (isOpen) {
        document.addEventListener('keydown', handleKeyDown)
      }
      return () => {
        document.removeEventListener('keydown', handleKeyDown)
      }
    }, [isOpen, onClose])
  
    if (!isOpen) return null
  
    return (
      <div
        className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50' 
        onClick={onClose} 
        role='dialog' 
        aria-modal='true' 
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onClose()}
      >
        <div
          className='bg-white w-[400px] max-w-full p-6 rounded-lg shadow-lg overflow-auto text-center' 
          onClick={(e) => e.stopPropagation()} 
          role='document'
          tabIndex={0}
        >
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
  const baseClass = 'py-2 px-12 rounded-xl font-semibold'
  const variantClass = variant === 'gradient' ? 'bg-gradient-to-b from-yellow-400 to-yellow-600 text-l text-white font-bold py-2 px-12 rounded-xl' : 'border border-yellow-400 text-yellow-400'

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
      <div className='flex justify-center gap-4'>
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
