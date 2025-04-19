export interface UserSearchBarProps {
  keyword: string
  suggestions: string[]
  onSelect: (value: string) => void
  onChange: (value: string) => void
  onSubmit: () => void
}