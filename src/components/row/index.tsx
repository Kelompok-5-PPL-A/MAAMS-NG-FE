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
  feedbacks,
  activeColumns = [0, 1, 2],
  currentWorkingColumn = 0
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

  const shouldShowCell = (index: number): boolean => {
    // For row 1, always show columns A, B, C
    if (rowNumber === 1 && index < 3) {
      return true;
    }
    
    if (causes[index]?.trim() !== '') {
      return true;
    }

    if (index === currentWorkingColumn && activeColumns.includes(index)) {
      if (rowNumber === 2) {
        return true;
      }

      if (rowNumber > 2) {
        return !disabledCells[index];
      }
    }
    
    return false;
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
          {Array.from({ length: cols }).map((_, index) => {
            const isVisible = shouldShowCell(index);
            
            if (isVisible) {
              const placeholder = index < disabledCells.length && !disabledCells[index] ? 'Isi sebab..' : '';
              
              return (
                <div data-testid='cell' key={`${alphabet[index]}${rowNumber}`}>
                  <Cell
                    cellName={`${alphabet[index]}${rowNumber}`}
                    cause={index < causes.length ? causes[index] : ''}
                    onChange={(newValue) => handleLocalCauseChange(index, newValue, causeStatuses[index])}
                    causeStatus={index < causeStatuses.length ? causeStatuses[index] : CauseStatus.Unchecked}
                    disabled={index < disabledCells.length ? disabledCells[index] : true}
                    placeholder={placeholder}
                    feedback={index < feedbacks.length ? feedbacks[index] : ''}
                  />
                </div>
              );
            } else {
              return (
                <div 
                  data-testid='empty-cell' 
                  key={`empty-${alphabet[index]}${rowNumber}`}
                  className="invisible"
                >
                  <Cell
                    cellName={`${alphabet[index]}${rowNumber}`}
                    cause=""
                    onChange={() => {}}
                    causeStatus={CauseStatus.Unchecked}
                    disabled={true}
                    placeholder=""
                    feedback=""
                  />
                </div>
              );
            }
          })}
        </div>
      )}
    </div>
  )
}