import React from 'react'
import { ButtonProps } from '@/components/types/button'

const Button: React.FC<ButtonProps> = ({
  onClick,
  variant = 'outline',
  children,
  disabled = false,
  type = 'button',
  className = '',
}) => {
  const baseClass = 'py-2 px-12 rounded-xl font-semibold transition-all duration-200 ease-in-out'
  const variantClass = variant === 'gradient' 
    ? 'bg-gradient-to-b from-yellow-400 to-yellow-600 text-l text-white font-bold hover:from-yellow-500 hover:to-yellow-700 disabled:opacity-50'
    : 'border border-yellow-400 text-yellow-400 hover:bg-yellow-50 disabled:opacity-50 disabled:hover:bg-transparent'

  return (
    <button
      onClick={onClick}
      className={`${baseClass} ${variantClass} ${className}`}
      disabled={disabled}
      type={type}
    >
      {children}
    </button>
  )
}

export default Button 