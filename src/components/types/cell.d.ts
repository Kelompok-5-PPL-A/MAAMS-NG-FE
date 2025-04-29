export interface CellProps {
  cellName: string
  cause: string
  onChange: (value: string) => void
  causeStatus: CauseStatus
  disabled: boolean
  placeholder: string
  feedback?: string
}