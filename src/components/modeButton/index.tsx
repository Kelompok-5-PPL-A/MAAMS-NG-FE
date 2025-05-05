import { ModeButtonProps } from '../../components/types/modeButton'
import React from 'react'

const ModeButton: React.FC<ModeButtonProps> = ({ mode }) => {
  return (
    <div className='flex items-center'>
      <button className='bg-[#FBC707] text-black px-1 py-1 rounded-xl text-xs font-bold'>
        {mode === 'PRIBADI' ? (
          <img src='/icons/pribadi.svg' alt='pribadi' className='w-4'/>
        ) : (
          <img src='/icons/publik.svg' alt='publik' className='w-4'/>
        )}
      </button>
      <p className='text-black px-3 py-1 rounded-xl text-xs font-bold'>{mode}</p>
    </div>
  )
}

export default ModeButton
