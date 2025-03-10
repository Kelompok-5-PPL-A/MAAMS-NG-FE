export interface RowProps {
    rowNumber: number
    cols: number
    causes: string[]
    causesId: string[]
    causeStatuses: CauseStatus[]
    disabledCells: boolean[]
    onCauseAndStatusChanges: (causeIndex: number, newValue: string, newStatus: CauseStatus) => void
    feedbacks: string[]
  }
  