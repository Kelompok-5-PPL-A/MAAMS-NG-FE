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

  // Helper function untuk menentukan apakah sel harus ditampilkan
  const shouldShowCell = (index: number): boolean => {
    // Baris 1: Selalu tampilkan 3 kolom pertama
    if (rowNumber === 1 && index < 3) {
      return true;
    }
    
    // Baris 2+: Hanya tampilkan sel jika:
    // 1. Kolom ini sedang dikerjakan (currentWorkingColumn)
    // 2. Kolom ini ada dalam activeColumns
    // 3. Kolom sebelumnya memiliki akar masalah
    if (rowNumber > 1) {
      return index === currentWorkingColumn && 
             activeColumns.includes(index);
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
            // Apakah sel ini harus ditampilkan?
            const isVisible = (rowNumber === 1 && index < 3) || shouldShowCell(index);
            
            if (isVisible) {
              // Tampilkan sel biasa jika visible
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
              // Tampilkan sel invisible untuk mempertahankan layout grid
              return (
                <div 
                  data-testid='empty-cell' 
                  key={`empty-${alphabet[index]}${rowNumber}`}
                  className="invisible" // Sel transparan untuk layout
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