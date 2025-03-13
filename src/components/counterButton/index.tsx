import { CounterButtonProps } from '../types/counterButton'
import React from 'react'

export const CounterButton: React.FC<CounterButtonProps> = ({ number, onIncrement, onDecrement }) => {
  const textStyle = 'text-2xl font-bold relative text-center whitespace-nowrap z-[1]'
  const decrementBorderBase =
    'border-r-0 flex h-10 py-2 px-8 justify-center items-center shrink-0 flex-nowrap rounded-tl-[10px] rounded-tr-none rounded-br-none rounded-bl-[10px] border-solid border relative'
  const incrementBorderBase =
    'border-l-0 flex h-10 py-2 px-8 justify-center items-center shrink-0 flex-nowrap rounded-tl-none rounded-tr-[10px] rounded-br-[10px] rounded-bl-none border-solid border relative z-[4]'

  let decrementStyle = 'text-[#fbc707] ' + textStyle
  let incrementStyle = 'text-[#fbc707] ' + textStyle
  let decrementBorderStyle = 'border-[#fbc707] ' + decrementBorderBase
  let incrementBorderStyle = 'border-[#fbc707] ' + incrementBorderBase

  if (number === 3) {
    decrementStyle = 'text-[#aeaeae] ' + textStyle
    decrementBorderStyle = 'border-[#aeaeae] ' + decrementBorderBase
  } else if (number === 5) {
    incrementStyle = 'text-[#aeaeae] ' + textStyle
    incrementBorderStyle = 'border-[#aeaeae] ' + incrementBorderBase
  }

  return (
    <div className='items-center my-2'>
      <h2 className='text-center text-sm font-bold text-black relative mx-auto mb-2'>Jumlah Kolom (Max 5)</h2>
      <div className='main-container flex justify-center items-center flex-nowrap relative mx-auto my-0'>
        <button onClick={onDecrement} className={decrementBorderStyle}>
          <span className={decrementStyle}>-</span>
        </button>
        <div className='flex h-10 py-2 px-8 justify-center items-center shrink-0 flex-nowrap bg-[#fbc707] relative z-[2]'>
          {number >= 0 && (
            <span className='shrink-0 basis-auto text-[14px] font-bold text-black relative text-left whitespace-nowrap z-[3]'>
              {number}
            </span>
          )}
        </div>
        <button onClick={onIncrement} className={incrementBorderStyle}>
          <span className={incrementStyle}>+</span>
        </button>
      </div>
    </div>
  )
}
