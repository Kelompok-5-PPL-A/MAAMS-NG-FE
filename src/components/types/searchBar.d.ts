export interface UserSearchBarProps {
  isAdmin: boolean
  publicAnalyses: boolean
  keyword: string
  suggestions: string[]
  onSelect: (value: string) => void
  onChange: (value: string) => void
  onSubmit: () => void
}