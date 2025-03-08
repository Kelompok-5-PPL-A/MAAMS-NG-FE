export interface ButtonProps {
    onClick: () => void
    variant?: 'outline' | 'gradient'
    children: React.ReactNode
    disabled?: boolean
    type?: 'button' | 'submit' | 'reset'
    className?: string
  }