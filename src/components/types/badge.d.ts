export interface BadgeProps {
    text: string
    isRemovable: boolean
    handleRemove?: MouseEventHandler<HTMLButtonElement>
  }