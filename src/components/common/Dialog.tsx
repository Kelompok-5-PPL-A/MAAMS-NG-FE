import React, { useEffect, useRef } from 'react'
import { DialogProps } from '../types/dialog'

const Dialog: React.FC<DialogProps> = ({ isOpen, onClose, children, title }) => {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
      if (dialogRef.current?.showModal) {
        dialogRef.current.showModal()
      } else if (dialogRef.current) {
        dialogRef.current.setAttribute('open', 'true')
      }
    } else {
      if (dialogRef.current?.close) {
        dialogRef.current.close()
      } else if (dialogRef.current) {
        dialogRef.current.removeAttribute('open')
      }
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <dialog
      ref={dialogRef}
      className='fixed inset-0 flex items-center justify-center bg-transparent p-0'
      aria-labelledby={title ? 'dialog-title' : undefined}
    >
      <button
        className='absolute inset-0 bg-black bg-opacity-50'
        onClick={onClose}
        aria-label='Close dialog'
      />
      <div className='relative bg-white w-[400px] max-w-full p-6 rounded-lg shadow-lg overflow-auto text-center'>
        {children}
      </div>
    </dialog>
  )
}

export default Dialog 