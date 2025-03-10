import { ReactNode } from 'react'

export interface CircularIconButtonProps {
  icon: ReactNode
  onClick?: MouseEventHandler<HTMLButtonElement>
  type: 'button' | 'submit' | 'reset'
  id?: string
}
