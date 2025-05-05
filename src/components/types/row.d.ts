import { CauseStatus } from '../../lib/enum'

export interface RowProps {
  rowNumber: number
  cols: number
  causes: string[]
  causeStatuses: CauseStatus[]
  disabledCells: boolean[]
  onCauseAndStatusChanges: (causeIndex: number, newValue: string, newStatus: CauseStatus) => void
  feedbacks: string[]
  activeColumns?: number[]
  currentWorkingColumn?: number
}