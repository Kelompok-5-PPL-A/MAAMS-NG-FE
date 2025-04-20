import { PaginationProps } from '../../components/types/pagination'
import React, { useState, useEffect, useRef } from 'react'
import toast from 'react-hot-toast'

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  const [inputMode, setInputMode] = useState(false)
  const [pageNumber, setPageNumber] = useState(currentPage)
  const inputRef = useRef<HTMLInputElement>(null)
  const [hovered, setHovered] = useState(false)

  useEffect(() => {
    if (inputMode && inputRef.current) {
      inputRef.current.focus()
    }
  }, [inputMode])

  const handleEllipsisClick = () => {
    setInputMode(true)
    setHovered(false)
  }

  const handlePageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputVal = e.target.value
    const pageNum = parseInt(inputVal, 10)
    if (inputVal === '' || (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages)) {
      setPageNumber(pageNum)
    }
  }

  const submitPageInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      e.key === 'Enter' &&
      !isNaN(pageNumber) &&
      pageNumber !== currentPage &&
      pageNumber >= 1 &&
      pageNumber <= totalPages
    ) {
      onPageChange(pageNumber)
      setInputMode(false)
    } else if (e.key === 'Enter' && isNaN(pageNumber)) {
      toast.error('Masukkan halaman yang ingin anda tuju')
    }
  }

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1)
    }
  }

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1)
    }
  }

  const pageButton = (page: number) => (
    <button
      key={page}
      type='button'
      className={`min-h-[38px] min-w-[38px] flex justify-center items-center ${
        page === currentPage
          ? 'text-black-800 font-bold border-2 border-[#FBC707] bg-white'
          : 'text-gray-800 bg-gray-200 hover:bg-gray-400 focus:bg-gray-300'
      } py-2 px-3 text-sm rounded-lg focus:outline-none`}
      onClick={() => onPageChange(page)}
    >
      {page}
    </button>
  )

  const ellipsis = () =>
    inputMode ? (
      <input
        key='ellipsis-input'
        type='number'
        ref={inputRef}
        value={pageNumber}
        onChange={handlePageInput}
        onKeyDown={submitPageInput}
        onBlur={() => setInputMode(false)}
        className='min-h-[38px] min-w-[38px] max-w-[100px] flex justify-center items-center text-gray-800 py-2 px-3 text-sm rounded-lg focus:outline-none bg-gray-200 border-2 border-[#FBC707] focus:bg-white'
        autoFocus
      />
    ) : (
      <button
        key='ellipsis'
        type='button'
        className={`min-h-[38px] min-w-[38px] flex justify-center items-center text-gray-800 py-2 px-3 text-sm rounded-lg focus:outline-none bg-gray-200 font-bold ${
          hovered ? 'hover:bg-gray-400' : ''
        } ${hovered ? 'focus:bg-gray-300' : ''}`}
        onClick={handleEllipsisClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        data-testid='ellipsis-button'
      >
        ...
      </button>
    )

  const renderPageButtons = () => {
    const buttons = []
    const showEllipsis = totalPages > 3

    if (!showEllipsis) {
      for (let i = 1; i <= totalPages; i++) {
        buttons.push(pageButton(i))
      }
    } else if (showEllipsis && totalPages - currentPage >= 3) {
      buttons.push(pageButton(currentPage))
      buttons.push(ellipsis())
      buttons.push(pageButton(totalPages))
    } else {
      for (let i = totalPages - 2; i <= totalPages; i++) {
        buttons.push(pageButton(i))
      }
    }

    return buttons
  }

  return (
    <nav className='flex justify-center items-center gap-x-7'>
      <button
        type='button'
        className={`min-h-[38px] min-w-[38px] py-2 px-2.5 inline-flex justify-center items-center gap-x-2 text-sm rounded-lg text-gray-800 focus:outline-none ${
          currentPage === 1 ? 'bg-gray-200' : 'bg-[#FBC707]'
        }`}
        onClick={goToPreviousPage}
        disabled={currentPage === 1}
        aria-label='Previous'
      >
        <svg
          className='flex-shrink-0 size-6'
          xmlns='http://www.w3.org/2000/svg'
          width='24'
          height='24'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='3'
          strokeLinecap='round'
          strokeLinejoin='round'
        >
          <path d='m15 18-6-6 6-6' />
        </svg>
        <span aria-hidden='true' className='sr-only'>
          Previous
        </span>
      </button>
      <div className='flex items-center gap-x-7'>{renderPageButtons()}</div>
      <button
        type='button'
        className={`min-h-[38px] min-w-[38px] py-2 px-2.5 inline-flex justify-center items-center gap-x-2 text-sm rounded-lg text-gray-800 focus:outline-none ${
          currentPage === totalPages ? 'bg-gray-200' : 'bg-[#FBC707]'
        }`}
        onClick={goToNextPage}
        disabled={currentPage === totalPages}
        aria-label='Next'
      >
        <svg
          className='flex-shrink-0 size-6'
          xmlns='http://www.w3.org/2000/svg'
          width='24'
          height='24'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='3'
          strokeLinecap='round'
          strokeLinejoin='round'
        >
          <path d='m9 18 6-6-6-6' />
        </svg>
        <span aria-hidden='true' className='sr-only'>
          Next
        </span>
      </button>
    </nav>
  )
}

export default Pagination