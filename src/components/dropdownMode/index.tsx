import { DropdownModeProps } from '@/components/types/dropdownMode'
import Mode from '@/constants/mode'
import React from 'react'
import { useState, useRef, useEffect } from 'react'
import { useOnClickOutside } from 'usehooks-ts'

export const DropdownMode: React.FC<DropdownModeProps> = ({ selectedMode, onChange }) => {
  const [selectedOption, setSelectedOption] = useState(selectedMode)
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setSelectedOption(selectedMode)
    setIsOpen(false)
  }, [selectedMode])

  const handleChange = (value: Mode) => {
    setSelectedOption(value)
    onChange(value)
    setIsOpen(false)
  }

  console.log(ref.current)

  useOnClickOutside(ref as React.RefObject<HTMLDivElement>, () => {
    setIsOpen(false)
  })

  return (
    <div className='relative' ref={ref}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-[200px] bg-yellow-400 cursor-pointer ${isOpen ? 'rounded-t-2xl' : 'rounded-2xl'} bg-royal px-4 py-2 text-md font-bold hover:bg-yellow-300 flex items-center justify-between shadow`}
      >
        <span className='pr-6'>{selectedOption}</span>
        <div>
          <svg
            className={`-mr-1 ml-2 h-5 w-5  origin-center ${isOpen ? 'rotate-180' : ''}`}
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 20 20'
            fill='currentColor'
            aria-hidden='true'
          >
            <path
              fillRule='evenodd'
              d='M10 12a1 1 0 01-.707-.293l-4-4a1 1 0 011.414-1.414L10 9.586l3.293-3.293a1 1 0 111.414 1.414l-4 4A1 1 0 0110 12z'
              clipRule='evenodd'
            />
          </svg>
        </div>
        {isOpen && (
          <div
            className='w-[200px] absolute top-8 left-0 mt-2 w-56 rounded-b-2xl shadow-lg bg-yellow-400 ring-1 ring-black ring-opacity-5'
            role='menu'
            aria-orientation='vertical'
            aria-labelledby='options-menu'
          >
            <div className='py-1'>
              {Object.values(Mode).map((option) => (
                <div
                  key={option}
                  onClick={() => handleChange(option)}
                  className='block px-4 py-2 text-sm hover:bg-yellow-300 hover:rounded-2xl cursor-pointer'
                  role='menuitem'
                >
                  {option}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}