export interface CustomInputProps {
    placeholder?: string
    label?: string
    labelClassName?: string
    inputClassName?: string
    errorClassName?: string
    spacerClassName?: string
    onChange: React.ChangeEventHandler<HTMLInputElement>
    onKeyDown?: KeyboardEventHandler<HTMLInputElement>
    value?: string | undefined
    children?: ReactNode
    error?: string
    isDisabled?: boolean
  }