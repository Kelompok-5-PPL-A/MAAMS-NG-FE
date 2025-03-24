import React from 'react'
import { ItemListHistoryProps } from '../types/itemListHistory'
import ModeButton from '../modeButton/index'
import { DeleteButton } from '../../components/deleteButton'
import Link from 'next/link'
import { useRouter } from 'next/router'

const ListItem: React.FC<ItemListHistoryProps & { showModeButton?: boolean }> = ({
  title,
  timestamp,
  mode,
  user,
  idQuestion,
  showModeButton = true,
  showDeleteButton,
  tags = []
}) => {
  return (
    <li className='flex justify-between border border-yellow-300 rounded-xl shadow-lg p-6 mb-4'>
      <Link href={`/validator/${idQuestion}`} className='z-0 relative w-full h-full'>
        <div className='min-w-0 gap-y-2'>
          {showModeButton ? (
            <div className='flex items-end'>
              <ModeButton mode={mode} />
              <div className='h-1 w-1 bg-gray-500 rounded-full mr-3 place-self-center' />
              <p className='text-sm leading-6 text-gray-500r'>{timestamp}</p>
            </div>
          ) : (
            <p className='text-sm leading-6 text-gray-500 mt-6'>{user}</p>
          )}
        </div>
        <p className='text-lg mt-3 mb-2 font-semibold leading-6 text-gray-900'>{title}</p>
        <div className='flex flex-wrap'>
          {tags.map((tag, index) => (
            <span
              key={index}
              className='bg-gray-200 rounded-full px-3 py-1 text-xs font-semibold leading-6 text-gray-900 mr-2'
            >
              {tag}
            </span>
          ))}
        </div>
      </Link>
      <div className='sm:flex sm:flex-col sm:items-end z-10 justify-start'>
        {showDeleteButton && <DeleteButton idQuestion={idQuestion} pathname={useRouter().pathname} />}
      </div>
    </li>
  )
}

export default ListItem
