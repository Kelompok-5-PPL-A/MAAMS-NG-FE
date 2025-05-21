import React from 'react'
import { CircularIconButtonProps } from '../types/circularIconButtonProps'

export const CircularIconButton: React.FC<CircularIconButtonProps> = ({ id, icon, onClick, type }) => {
  return (
    <div className='w-[52px] h-[52px] bg-yellow-400 rounded-full flex justify-center items-center'>
      <button data-testid='submit-question' id={id} type={type} color='black' onClick={onClick}>
        {icon}
      </button>
    </div>
  )
}
