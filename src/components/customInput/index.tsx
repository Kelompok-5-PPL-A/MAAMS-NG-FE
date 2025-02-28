import { CustomInputProps } from '../types/customInput'
import React from 'react'
import { Input, Icon, InputGroup } from '@chakra-ui/react'
import { WarningTwoIcon } from '@chakra-ui/icons'

export const CustomInput: React.FC<CustomInputProps> = ({
  placeholder,
  label,
  labelClassName,
  inputClassName,
  errorClassName,
  spacerClassName,
  onChange,
  onKeyDown,
  value,
  children,
  error,
  isDisabled
}) => {
  const getIcon = () => {
    if (error) {
      return <Icon as={WarningTwoIcon} color='red.500' />
    } else {
      return null
    }
  }

  return (
    <div className={`${spacerClassName ?? 'space-y-4'} w-full`}>
      {!!label && <label className={`${labelClassName}`}>{label}</label>}
      <InputGroup className='border-zinc-500'>
        <Input
          placeholder={placeholder}
          onChange={onChange}
          onKeyDown={onKeyDown}
          value={value}
          className={`${inputClassName} disabled:text-black`}
          disabled={isDisabled}
          variant={isDisabled ? 'filled' : 'outline'}
        />
        {children}
      </InputGroup>
      <div className='flex items-center gap-4'>
        {getIcon()}
        {!!error && <label className={`${errorClassName}`}>{error}</label>}
      </div>
    </div>
  )
}