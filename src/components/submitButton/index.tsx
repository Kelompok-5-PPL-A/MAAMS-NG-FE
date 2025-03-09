import React from 'react'

interface SubmitButtonProps {
  onClick: () => void
  disabled: boolean
  label: string
}

export const SubmitButton: React.FC<SubmitButtonProps> = ({ onClick, disabled, label }) => {
  const commonClasses =
    'inline-flex items-center justify-center relative h-12 px-6 rounded-lg gap-2 transition duration-150 ease-in-out transform active:scale-95 mt-4 text-white font-semibold'
  const enabledClasses = `bg-gradient-to-b from-[#fbc707] to-[#c9a317] cursor-pointer`
  const disabledClasses = 'bg-gradient-to-b from-gray-300 to-gray-400 cursor-not-allowed opacity-50'

  const buttonClasses = `${commonClasses} ${disabled ? disabledClasses : enabledClasses}`

  return (
    <button onClick={onClick} disabled={disabled} className={buttonClasses}>
      {label}
    </button>
  )
}
