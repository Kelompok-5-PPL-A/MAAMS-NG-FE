import { CauseStatus } from '../../lib/enum'

export interface Rows {
  id: number
  causes: string[]
  causesId: string[]
  statuses: CauseStatus[]
  feedbacks: string[]
  disabled: boolean[]
}