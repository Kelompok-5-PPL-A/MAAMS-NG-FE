import React, { useState, useEffect } from 'react'
import { Cell } from '../cell/index'
import { CauseStatus } from '../../lib/enum'
import { RowProps } from '../types/row'

export const Row: React.FC<RowProps> = ({
  rowNumber,
  cols,
  causes,
  causeStatuses,
  disabledCells,
  onCauseAndStatusChanges,
  feedbacks
}) => {
  const alphabet = 'ABCDE'
  const [localCauses, setLocalCauses] = useState<string[]>(causes)
  const [localCauseStatuses, setLocalCauseStatuses] = useState<CauseStatus[]>(causeStatuses)

  useEffect(() => {
    setLocalCauses(causes.slice(0, cols).concat(Array(Math.max(cols - causes.length, 0)).fill('')))
    setLocalCauseStatuses(
      causeStatuses.slice(0, cols).concat(Array(Math.max(cols - causeStatuses.length, 0)).fill(CauseStatus.Unchecked))
    )
  }, [cols, causes, causeStatuses])

  const handleLocalCauseChange = (causeIndex: number, newValue: string, newStatus: CauseStatus) => {
    const updatedCauses = [...localCauses]
    updatedCauses[causeIndex] = newValue
    setLocalCauses(updatedCauses)

    const updatedStatuses = [...localCauseStatuses]
    updatedStatuses[causeIndex] = newStatus
    setLocalCauseStatuses(updatedStatuses)

    onCauseAndStatusChanges(causeIndex, newValue, newStatus)
  }

  let gridClass = ''
  if (cols === 3) {
    gridClass = 'grid grid-cols-3 gap-0 items-stretch my-8'
  } else if (cols === 4) {
    gridClass = 'grid grid-cols-4 gap-0 items-stretch my-8'
  } else {
    gridClass = 'grid grid-cols-5 gap-0 items-stretch my-8'
  }

  return (
    <div>
      {cols >= 3 && cols <= 5 && (
        <div className={gridClass} data-testid='row-container'>
          {causes.map((cause, index) => (
            <div data-testid='cell' key={`${alphabet[index]}${rowNumber}`}>
              <Cell
                cellName={`${alphabet[index]}${rowNumber}`}
                cause={cause}
                onChange={(newValue) => handleLocalCauseChange(index, newValue, localCauseStatuses[index])}
                causeStatus={causeStatuses[index]}
                disabled={disabledCells[index]}
                placeholder={disabledCells[index] ? '' : 'Isi sebab..'}
                feedback={feedbacks[index]}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
