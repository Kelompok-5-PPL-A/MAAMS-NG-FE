import React from 'react'
import { BadgeProps } from '@/components/types/badge'

export const Badge: React.FC<BadgeProps> = ({ text, isRemovable, handleRemove }) => {
  return (
    <div className='flex items-center bg-yellow-400 rounded-full px-3 py-1'>
      <span>{text}</span>
      {isRemovable && (
        <button type='button' data-testid='remove-tag-button' onClick={handleRemove} className='ml-2 text-black'>
          <svg xmlns='http://www.w3.org/2000/svg' className='h-4 w-4' viewBox='0 0 20 20' fill='currentColor'>
            <path
              fillRule='evenodd'
              d='M5.293 5.293a1 1 0 011.414 0L10 8.586l3.293-3.293a1 1 0 111.414 1.414L11.414 10l3.293 3.293a1 1 0 01-1.414 1.414L10 11.414l-3.293 3.293a1 1 0 01-1.414-1.414L8.586 10 5.293 6.707a1 1 0 010-1.414z'
              clipRule='evenodd'
            />
          </svg>
        </button>
      )}
    </div>
  )
}