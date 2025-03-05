import Mode from 'constants/mode'

export interface DropdownModeProps {
  selectedMode?: Mode
  onChange: (mode: Mode) => void
}