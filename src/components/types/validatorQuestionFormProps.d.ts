import Mode from 'constants/mode'

export interface ValidatorQuestionFormProps {
  id?: string | string[] | undefined
  validatorData?: ValidatorData
}

export interface ValidatorData {
  title: string
  question: string
  tags: string[]
  mode: Mode
  username: string
  created_at: string
  id?: string | string[] | undefined
}
