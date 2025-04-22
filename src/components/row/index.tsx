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

  // Determine if cell should be visible
  const shouldShowCell = (index: number): boolean => {
    // For row 1, always show columns A, B, C
    if (rowNumber === 1 && index < 3) {
      return true;
    }
    
    // For rows > 1:
    
    // Always show cells that have content or feedback
    if (causes[index]?.trim() !== '' || feedbacks[index]?.trim() !== '') {
      return true;
    }
    
    // For the current working column, always show cells that are in active rows
    if (index === currentWorkingColumn && activeColumns.includes(index)) {
      // Check if previous row in this column has a valid cause (for rows > 2)
      if (rowNumber > 2) {
        // We need to determine this from props since we don't have access to the full causes data
        // This is a simplification; the real logic should respect the disabled state
        return !disabledCells[index];
      }
      
      // For row 2, we show it if column is active and working column
      return true;
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
            // Check if this cell should be visible
            const isVisible = shouldShowCell(index);
            
            if (isVisible) {
              return (
                <div data-testid='cell' key={`${alphabet[index]}${rowNumber}`}>
                  <Cell
                    cellName={`${alphabet[index]}${rowNumber}`}
                    cause={index < causes.length ? causes[index] : ''}
                    onChange={(newValue) => handleLocalCauseChange(index, newValue, causeStatuses[index])}
                    causeStatus={index < causeStatuses.length ? causeStatuses[index] : CauseStatus.Unchecked}
                    disabled={index < disabledCells.length ? disabledCells[index] : true}
                    placeholder={index < disabledCells.length && !disabledCells[index] ? 'Isi sebab..' : ''}
                    feedback={index < feedbacks.length ? feedbacks[index] : ''}
                  />
                </div>
              );
            } else {
              // Create empty cell for layout (invisible)
              return (
                <div 
                  data-testid='empty-cell' 
                  key={`empty-${alphabet[index]}${rowNumber}`}
                  className="invisible" // Make cell transparent for layout
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