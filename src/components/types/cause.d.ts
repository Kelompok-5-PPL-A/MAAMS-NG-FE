import Mode from '../../constants/mode'

export interface Cause {
  id: string
  problem: string
  column: number
  row: number
  mode: Mode
  cause: string
  status: boolean
  feedback: string
  root_status: boolean
}