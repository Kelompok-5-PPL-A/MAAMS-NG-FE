import React, { useState } from 'react'
import { AutoComplete, AutoCompleteChangeEvent, AutoCompleteCompleteEvent } from 'primereact/autocomplete'
import SearchFilter from '../searchFilter'
import { UserSearchBarProps } from './types/userSearchBarProps'

export const SearchBar: React.FC<UserSearchBarProps> = ({
  keyword,
  suggestions,
  onSelect,
  onChange,
  onSubmit
}) => {
  const [items, setItems] = useState<string[]>([])

  const search = (e: AutoCompleteCompleteEvent) => {
    setItems(suggestions.filter((item) => item.toLowerCase().includes(e.query.toLowerCase())))
  }

  const handleInputChange = (e: AutoCompleteChangeEvent) => {
    onChange(e.target.value)
    setItems(suggestions.filter((item) => item.toLowerCase().includes(e.target.value.toLowerCase())))
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      onSubmit()
    }
  }

  return (
    <div className='md:mx-12 max-md:flex-wrap max-md:px-5'>
      <div className='flex gap-0 self-stretch shadow-lg rounded-[10px]'>
        <SearchFilter updateFilter={onSelect} />
        <AutoComplete
          className='w-full text-base bg-white rounded-bl-none rounded-tl-none rounded-tr-none rounded-br-none rounded-bl-[10px] border border-yellow-400 border-solid text-slate-400 max-md:max-w-full placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400'
          inputClassName='w-full p-4 text-base bg-white text-slate-400 max-md:max-w-full placeholder-gray-500 focus:outline-none focus:outline-none focus:ring-2 focus:ring-yellow-400'
          panelClassName='p-2 text-base border border-yellow-400 border-solid bg-white text-slate-400 max-md:max-w-full placeholder-gray-500 focus:outline-none'
          placeholder='Cari analisis..'
          emptyMessage='No results found.'
          autoHighlight={true}
          maxLength={64}
          value={keyword}
          suggestions={items}
          completeMethod={search}
          onChange={handleInputChange}
          onKeyPress={handleKeyDown}
        />
        <button
          onClick={onSubmit}
          data-testid='search-button'
          className='flex justify-center items-center px-4 py-3.5 bg-yellow-400 rounded-tl-none rounded-tr-[10px] rounded-br-[10px] rounded-bl-none border border-yellow-400 border-solid'
        >
          <img
            loading='lazy'
            src='https://cdn.builder.io/api/v1/image/assets/TEMP/8175883398446009fa87a890bfdf85c1492a6223a2e4d833b9641dbb494df310?'
            className='w-6 aspect-square'
            alt='Search Icon'
          />
        </button>
      </div>
    </div>
  )
}