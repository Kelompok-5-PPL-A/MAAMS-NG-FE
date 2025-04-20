import React from 'react'
import dynamic from 'next/dynamic'
import { SearchFilterProps } from '../../components/types/searchFilterProps'

const NoSSRSearchFilter: React.FC<SearchFilterProps> = ({ updateFilter }) => {
  const filterValues = ['Semua', 'Judul', 'Topik']

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newFilter = e.target.value
    updateFilter(newFilter)
  }

  return (
    <div className='max-md:flex-wrap'>
      <div className='h-full flex gap-0 self-stretch shadow-lg rounded-tl-[10px] bg-yellow-400 rounded-bl-[10px]'>
        <select
          data-testid='filter-select'
          role='combobox'
          className='rounded-bl-[10px] rounded-tl-[10px] px-4 py-3.5 flex bg-inherit justify-center items-center mr-3'
          onChange={handleChange}
        >
          {filterValues.map((value, index) => (
            <option className='bg-white' key={index} value={value}>
              {value}
            </option>
          ))}
        </select>
      </div>
      <div data-testid='suggestion-list'></div>
    </div>
  )
}

const SearchFilter = dynamic(() => Promise.resolve(NoSSRSearchFilter), {
  ssr: false
})

export default SearchFilter
