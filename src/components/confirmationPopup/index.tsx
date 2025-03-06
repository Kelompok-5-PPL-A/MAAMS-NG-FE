import React, { useState, useCallback } from 'react'
import { ConfirmationPopupProps } from '../types/confirmation'
import Mode from '../../constants/mode'
import Dialog from '../common/Dialog'
import Button from '../common/Button'

const ConfirmationPopup: React.FC<ConfirmationPopupProps> = ({ mode, onConfirm, onCancel }) => {
  const [isOpen, setIsOpen] = useState(true)

  const handleConfirm = useCallback(() => {
    onConfirm()
    setIsOpen(false)
  }, [onConfirm])

  const handleCancel = useCallback(() => {
    onCancel()
    setIsOpen(false)
  }, [onCancel])

  const getMessage = useCallback(() => {
    if (mode === Mode.pengawasan) {
      return 'Apakah Anda yakin ingin menampilkan analisis ini kepada Admin?'
    }
    return 'Ubah analisis menjadi pribadi?'
  }, [mode])

  const message = getMessage()

  return (
    <Dialog isOpen={isOpen} onClose={handleCancel} title={message}>
      <h2 id="dialog-title" className='text-xl font-bold mb-4'>{message}</h2>
      <div className='flex justify-center gap-4'>
        <Button
          variant='outline'
          onClick={handleCancel}
          className='min-w-[120px]'
        >
          Batal
        </Button>
        <Button
          variant='gradient'
          onClick={handleConfirm}
          className='min-w-[120px]'
        >
          Simpan
        </Button>
      </div>
    </Dialog>
  )
}

export default ConfirmationPopup
