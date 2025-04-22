import React from 'react'
import { CauseStatus } from '../../lib/enum'
import { CellProps } from '../types/cell'

export const Cell: React.FC<CellProps> = ({
  cellName,
  cause,
  onChange,
  causeStatus,
  disabled,
  placeholder,
  feedback
}) => {
  const getOutlineClass = (status: CauseStatus) => {
    switch (status) {
      case CauseStatus.Incorrect:
        return 'border-red-500'
      case CauseStatus.CorrectNotRoot:
        return 'border-green-500'
      case CauseStatus.CorrectRoot:
        return 'border-purple-500'
      case CauseStatus.Resolved:
        return 'border-gray-200'
      case CauseStatus.Unchecked:
      default:
        return 'border-black'
    }
  }

  const outlineClass = getOutlineClass(causeStatus)

  const renderFeedback = () => {
    let emoji = ''
    let color = ''
    let feedbackText = feedback || ''
    
    switch (causeStatus) {
      case CauseStatus.CorrectRoot:
        emoji = '☑️'
        color = 'purple'
        if (!feedbackText.includes('Akar Masalah')) {
          feedbackText = `Akar Masalah Kolom ${cellName[0]} ditemukan: ${feedbackText}`
        }
        break
      case CauseStatus.CorrectNotRoot:
        emoji = '✅'
        color = 'green'
        break
      case CauseStatus.Incorrect:
        emoji = '❌'
        color = 'red'
        break
      default:
        return null
    }

    return (
      <div className='feedback-text mt-4' style={{ color: color }}>
        {emoji} {feedbackText}
      </div>
    )
  }

  return (
    <div className='flex flex-col items-center justify-center relative'>
      <div className='relative w-fit mt-[-1.00px] font-bold text-black text-2xl leading-10 mb-2 whitespace-nowrap'>
        {cellName}
      </div>
      <textarea
        value={cause}
        onChange={(event) => {
          !disabled && onChange(event.target.value)
        }}
        rows={1}
        maxLength={148}
        className={`w-full h-22 text-xs resize-none flex pt-4 px-4 pb-16 items-center bg-[#ececec] border-solid border-2 ${outlineClass} relative z-[1]`}
        placeholder={placeholder}
        disabled={disabled}
      ></textarea>
      {renderFeedback()}
    </div>
  )
}