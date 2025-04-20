import React, { useState, useEffect } from 'react'
import MainLayout from '../../layout/MainLayout'
import { CounterButton } from '../../components/counterButton'
import { Row } from '../../components/row'
import { useRouter } from 'next/router'
import { ValidatorData } from '../../components/types/validatorQuestionFormProps'
import Mode from '../../constants/mode'
import { SubmitButton } from '../../components/submitButton'
import { CauseStatus } from '../../lib/enum'
import { Cause } from '../../components/types/cause'
import { Rows } from '@/components/types/rows'
import { ValidatorQuestionForm } from '@/components/validatorQuestionForm'
import toast from 'react-hot-toast'
import axiosInstance from '../../services/axiosInstance'

const defaultValidatorData: ValidatorData = {
    title: '',
    question: '',
    mode: Mode.pribadi,
    created_at: '',
    username: '',
    tags: []
}
  
const defaultCause: Cause = {
    root_status: false,
    id: '',
    problem: '',
    column: 0,
    row: 0,
    mode: Mode.pribadi,
    cause: '',
    status: false,
    feedback: ''
}

function createInitialRow(id: number, cols: number): Rows {
    return {
        id,
        causes: Array(cols).fill(''),
        causesId: Array(cols).fill(''),
        statuses: Array(cols).fill(CauseStatus.Unchecked),
        feedbacks: Array(cols).fill(''),
        disabled: Array(cols).fill(false)
    }
}

function adjustArraySize<T>(array: T[], size: number, defaultValue: T): T[] {
    const currentSize = array.length
    if (size > currentSize) {
        return [...array, ...Array(size - currentSize).fill(defaultValue)]
    } else {
        return array.slice(0, size)
    }
}

const ValidatorDetailPage: React.FC = () => {
    const router = useRouter()
    const id = router.query.id
    const [validatorData, setValidatorData] = useState<ValidatorData>(defaultValidatorData)
    const [columnCount, setColumnCount] = useState<number>(3)
    const [rows, setRows] = useState<Rows[]>([createInitialRow(1, 3)])
    const [causes, setCauses] = useState<Cause[]>([defaultCause])
    const [canAdjustColumns, setCanAdjustColumns] = useState<boolean>(true)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [isDone, setIsDone] = useState<boolean>(false)
    
    // State untuk pelacakan kolom aktif
    const [activeColumns, setActiveColumns] = useState<number[]>([0, 1, 2])
    
    // State untuk kolom yang sedang dianalisis
    const [currentWorkingColumn, setCurrentWorkingColumn] = useState<number>(0)

    const increaseColumnCount = (count: number) => {
        setRows((prevRows) =>
          prevRows.map((row) => ({
            ...row,
            causes: adjustArraySize(row.causes, count, ''),
            statuses: adjustArraySize(row.statuses, count, CauseStatus.Unchecked),
            feedbacks: adjustArraySize(row.feedbacks, count, ''),
            disabled: adjustArraySize(row.disabled, count, false)
          }))
        )
    }

    const adjustColumnCount = (increment: boolean) => {
        if (!canAdjustColumns) return
    
        setColumnCount((prevCount) => {
            const newCount = increment ? Math.min(prevCount + 1, 5) : Math.max(prevCount - 1, 3)
            increaseColumnCount(newCount)
            return newCount
        })
    }

    const isSubmitDisabled = (): boolean => {
        if (isLoading) return true;
        
        const hasUnvalidatedInput = rows.some(row => {
            if (row.id === 1) {
                return row.causes.slice(0, 3).some((cause, index) => 
                    cause.trim() !== '' && row.statuses[index] === CauseStatus.Unchecked
                );
            }
            
            return row.causes[currentWorkingColumn]?.trim() !== '' && 
                   row.statuses[currentWorkingColumn] === CauseStatus.Unchecked;
        });
        
        return !hasUnvalidatedInput;
    }

    useEffect(() => {
        if (id) {
            getQuestionData()
            getCauses()
        }
    }, [id])

    const getQuestionData = async () => {
        if (!id) return
        try {
          const response = await axiosInstance.get(`/question/${id}`)
          const receivedData: ValidatorData = response.data
          setValidatorData(receivedData)
        } catch (error: any) {
          toast.error('Gagal mengambil data analisis')
          router.push('/')
        }
    }
    
    const updateCauseAndStatus = (rowId: number, columnIndex: number, newCause: string, newStatus: CauseStatus) => {
        const updateRow = (row: Rows): Rows => {
            if (row.id !== rowId) return row;
            
            const updatedCauses = [...row.causes];
            updatedCauses[columnIndex] = newCause;
            
            const updatedStatuses = [...row.statuses];
            updatedStatuses[columnIndex] = newStatus;
            
            return {
                ...row,
                causes: updatedCauses,
                statuses: updatedStatuses
            };
        };
        
        setRows(prevRows => prevRows.map(updateRow));
    }

    useEffect(() => {
        if (causes.length > 0 && causes[0].id !== '') {
            const update = updateRows(causes)
            setRows(update)
            increaseColumnCount(columnCount)
            
            const newActiveColumns = updateActiveColumns(causes)
            setActiveColumns(newActiveColumns)
            
            const nextWorkingColumn = findNextWorkingColumn(causes)
            setCurrentWorkingColumn(nextWorkingColumn)
        }
    }, [causes])

    useEffect(() => {
        setRows(updateResolvedStatuses(rows))
    }, [rows.length])
    
    const findNextWorkingColumn = (causesData: Cause[]): number => {
        const row1Causes = causesData.filter(cause => cause.row === 1 && cause.status);
        
        if (row1Causes.length < 3) {
            return 0;
        }
        
        for (let col = 0; col < columnCount; col++) {
            const hasRootCause = causesData.some(cause => 
                cause.column === col && cause.root_status === true
            );
            
            if (!hasRootCause) {
                return col;
            }
        }
        
        return 0;
    };

    const createCausesFromRow = async (rowNumber: number) => {
        try {
          const row = rows.find((row) => row.id === rowNumber)
          if (!row) return

          const createPromises = row.causes
            .map((cause, index) => ({ cause, index }))
            .filter(({ index, cause }) => {
                if (row.id === 1) {
                    return index < 3 && 
                           cause.trim() !== '' &&
                           row.statuses[index] === CauseStatus.Unchecked;
                } else {
                    return cause.trim() !== '' &&
                           index === currentWorkingColumn &&
                           row.statuses[index] === CauseStatus.Unchecked;
                }
            })
            .map(({ cause, index }) => ({
              question_id: id,
              cause: cause,
              row: row.id,
              column: index,
              mode: validatorData.mode
            }))
            .map((data) => axiosInstance.post(`/cause/`, data))
    
          await Promise.all(createPromises)
        } catch (error: any) {
          toast.error('Gagal menambahkan sebab: ' + (error.response?.data?.detail || error.message))
        }
    }

    const patchCausesFromRow = async (rowNumber: number) => {
        const row = rows.find((row) => row.id === rowNumber)
        if (!row) return

        const patchPromises = row.causes.map((cause, index) => {
            let shouldPatch = false;
            
            if (row.id === 1) {
                shouldPatch = index < 3 && 
                              cause.trim() !== '' && 
                              row.causesId[index] && 
                              row.statuses[index] === CauseStatus.Unchecked;
            } else {
                shouldPatch = cause.trim() !== '' && 
                              row.causesId[index] && 
                              index === currentWorkingColumn &&
                              row.statuses[index] === CauseStatus.Unchecked;
            }
            
            if (shouldPatch) {
                return axiosInstance.patch(`/cause/patch/${id}/${row.causesId[index]}/`, { cause });
            }
            return null;
        }).filter(promise => promise !== null);

        await Promise.all(patchPromises);
    }

    const validateCauses = async () => {
        await axiosInstance.patch(`/cause/validate/${id}/`)
        toast.success('Sebab selesai divalidasi')
    }

    const getCauses = async (): Promise<Cause[]> => {
        if (!id) return []
    
        try {
          const response = await axiosInstance.get(`/cause/${id}/`)
          const tempCauses: Cause[] = response.data ?? []
          if (tempCauses.length > 0) {
            setCauses(tempCauses)
            setCanAdjustColumns(false)
            return tempCauses
          } else {
            setRows([createInitialRow(1, 3)])
            return []
          }
        } catch (error: any) {
          toast.error('Gagal mengambil sebab')
          return []
        }
    }

    const getStatusValue = (cause: Cause): CauseStatus => {
      if (cause.root_status) {
        return CauseStatus.CorrectRoot;
      } else if (cause.status) {
        return CauseStatus.CorrectNotRoot;
      } else {
        return CauseStatus.Incorrect;
      }
    };

    const addRow = (updatedRows: Rows[]): Rows[] => {
        return [...updatedRows, createInitialRow(updatedRows.length + 1, columnCount)]
    }

    const checkStatus = (updatedRows: Rows[]): Rows[] => {
        const allActiveColumnsHaveRoot = activeColumns.every(column => {
            return causes.some(cause => 
                cause.column === column && cause.root_status === true
            );
        });
  
        if (allActiveColumnsHaveRoot) {
            setIsDone(true);
            return updatedRows;
        }
  
        const validRowsInCurrentColumn = causes
            .filter(cause => cause.column === currentWorkingColumn && cause.status === true)
            .map(cause => cause.row);
        
        const maxValidRow = validRowsInCurrentColumn.length > 0 
            ? Math.max(...validRowsInCurrentColumn) 
            : 0;
        
        const hasRootCause = causes.some(cause => 
            cause.column === currentWorkingColumn && cause.root_status === true
        );
        
        if (!hasRootCause && maxValidRow > 0) {
            const hasNextRow = updatedRows.some(row => row.id === maxValidRow + 1);
            
            if (!hasNextRow) {
                return addRow(updatedRows);
            }
        }
  
        return updatedRows;
    };
  
    const updateResolvedStatuses = (updatedRows: Rows[]): Rows[] => {
        const newRows = [...updatedRows];
  
        for (let col = 0; col < columnCount; col++) {
            const rootCauseRow = causes
                .filter(cause => cause.column === col && cause.root_status === true)
                .map(cause => cause.row)[0];
            
            if (rootCauseRow !== undefined) {
                for (let index = 0; index < newRows.length; index++) {
                    // Pertahankan status CorrectRoot untuk baris yang mengandung akar masalah
                    if (newRows[index].id === rootCauseRow) {
                        // Pastikan sel root cause tetap memiliki status CorrectRoot
                        if (newRows[index].statuses[col] !== CauseStatus.CorrectRoot) {
                            newRows[index] = {
                                ...newRows[index],
                                statuses: [
                                    ...newRows[index].statuses.slice(0, col),
                                    CauseStatus.CorrectRoot,
                                    ...newRows[index].statuses.slice(col + 1)
                                ],
                                disabled: [
                                    ...newRows[index].disabled.slice(0, col),
                                    true,
                                    ...newRows[index].disabled.slice(col + 1)
                                ]
                            };
                        }
                        continue;
                    }
                    
                    // Nonaktifkan sel setelah akar masalah
                    if (newRows[index].id > rootCauseRow) {
                        newRows[index] = {
                            ...newRows[index],
                            statuses: [
                                ...newRows[index].statuses.slice(0, col),
                                CauseStatus.Resolved,
                                ...newRows[index].statuses.slice(col + 1)
                            ],
                            causes: [
                                ...newRows[index].causes.slice(0, col),
                                '',
                                ...newRows[index].causes.slice(col + 1)
                            ],
                            disabled: [
                                ...newRows[index].disabled.slice(0, col),
                                true,
                                ...newRows[index].disabled.slice(col + 1)
                            ]
                        };
                    }
                }
            }
        }
  
        return newRows;
    };
    
    const updateActiveColumns = (causesData: Cause[]): number[] => {
        const minColumns = [0, 1, 2];
        
        const result = [...minColumns];
        
        for (let col = 3; col < columnCount; col++) {
            const previousColumnsHaveRoots = Array(col)
                .fill(0)
                .map((_, i) => i)
                .every(prevCol => 
                    causesData.some(cause => cause.column === prevCol && cause.root_status === true)
                );
            
            if (previousColumnsHaveRoots) {
                result.push(col);
            } else {
                break;
            }
        }
        
        return result;
    };
    
    const processAndSetRows = (causesData: Cause[]): Rows[] => {
        const groupedCauses: { [key: number]: Cause[] } = {};
        
        causesData.forEach((cause) => {
            const { row } = cause;
            if (!groupedCauses[row]) {
                groupedCauses[row] = [];
            }
            groupedCauses[row].push(cause);
        });
        
        const processedRows = Object.entries(groupedCauses).map(([rowNumber, rowCauses]) => {
          const causes = Array(columnCount).fill('');
          const causesId = Array(columnCount).fill('');
          const statuses = Array(columnCount).fill(CauseStatus.Unchecked);
          const feedbacks = Array(columnCount).fill('');
          const disabled = Array(columnCount).fill(false);
          
          rowCauses.forEach((cause) => {
              const colIndex = cause.column;
              causes[colIndex] = cause.cause;
              causesId[colIndex] = cause.id;
              statuses[colIndex] = getStatusValue(cause);
              feedbacks[colIndex] = cause.feedback;
          });
          
          // Enhanced: Apply column-by-column approach for disabling cells
          for (let colIndex = 0; colIndex < columnCount; colIndex++) {
              // Make cell read-only if it has been validated successfully (has green border/checkmark)
              if (statuses[colIndex] === CauseStatus.CorrectNotRoot || 
                  statuses[colIndex] === CauseStatus.CorrectRoot) {
                  disabled[colIndex] = true;
                  continue;
              }
              
              if (parseInt(rowNumber) === 1) {
                  // For row 1, only disable cells beyond column C if unchecked
                  if (colIndex >= 3 && statuses[colIndex] === CauseStatus.Unchecked) {
                      disabled[colIndex] = true;
                  }
              } else {
                  // For other rows, apply the normal logic for unvalidated cells
                  const prevRowCause = causesData.find(c => 
                      c.row === parseInt(rowNumber) - 1 && c.column === colIndex
                  );
                  
                  const hasRootInColumn = causesData.some(c => 
                      c.column === colIndex && c.root_status === true
                  );
                  
                  const isPrevRowValid = prevRowCause?.status === true && !prevRowCause?.root_status;
                  
                  const previousColumnsComplete = Array(colIndex)
                      .fill(0)
                      .map((_, i) => i)
                      .every(prevCol => 
                          causesData.some(cause => 
                              cause.column === prevCol && 
                              cause.root_status === true
                          )
                      );
                  
                  // Disable if conditions not met for editing
                  if (!isPrevRowValid || 
                      hasRootInColumn || 
                      !previousColumnsComplete || 
                      colIndex !== currentWorkingColumn) {
                      disabled[colIndex] = true;
                  }
              }
          }
          
          return {
              id: parseInt(rowNumber),
              causes,
              causesId,
              statuses,
              feedbacks,
              disabled
          };
        });
      
        return processedRows;
    };
    
    const updateRows = (causesData: Cause[]): Rows[] => {
        const tempRows = processAndSetRows(causesData);
        const resolvedRows = updateResolvedStatuses(tempRows);
        const colCount = resolvedRows.length > 0 ? resolvedRows[0].causes.length : 3;
        setColumnCount(colCount);
        return checkStatus(resolvedRows);
    };
    
    const submitCauses = async () => {
        try {
            setIsLoading(true);
            const loadID = toast.loading('Melakukan Analisis, Mohon Tunggu...');
            
            const rowsToProcess = rows.filter(row => {
                if (row.id === 1) {
                    return row.causes.slice(0, 3).some((cause, index) => 
                        cause.trim() !== '' && row.statuses[index] === CauseStatus.Unchecked
                    );
                }
                
                return row.causes[currentWorkingColumn]?.trim() !== '' && 
                       row.statuses[currentWorkingColumn] === CauseStatus.Unchecked;
            });
            
            for (const row of rowsToProcess) {
                const isNewRow = row.causesId.every(id => !id);
                
                if (isNewRow) {
                    await createCausesFromRow(row.id);
                } else {
                    await patchCausesFromRow(row.id);
                }
            }
            
            await validateCauses();
            const updatedCauses = await getCauses();
            
            const newActiveColumns = updateActiveColumns(updatedCauses);
            setActiveColumns(newActiveColumns);
            
            const nextWorkingColumn = findNextWorkingColumn(updatedCauses);
            setCurrentWorkingColumn(nextWorkingColumn);
            
            setIsLoading(false);
            toast.dismiss(loadID);
        } catch (error: any) {
            const errorMessage = error.response?.data?.detail || 'An unexpected error occurred';
            toast.error('Gagal validasi sebab: ' + errorMessage);
            setIsLoading(false);
            toast.dismiss();
        }
    };
    
    return (
        <MainLayout>
            <div className='flex flex-col w-full gap-8'>
                <ValidatorQuestionForm id={id} validatorData={validatorData} />
              
                <h1 className='text-2xl font-bold text-black'>Sebab:</h1>
              
                <CounterButton
                    number={columnCount}
                    onIncrement={() => adjustColumnCount(true)}
                    onDecrement={() => adjustColumnCount(false)}
                    disabled={!canAdjustColumns}
                />
                    
                {rows.map((row) => (
                    <div key={row.id}>
                        <Row
                            rowNumber={row.id}
                            cols={columnCount}
                            causes={row.causes}
                            causeStatuses={row.statuses}
                            disabledCells={row.disabled}
                            onCauseAndStatusChanges={(causeIndex: number, newValue: string, newStatus: CauseStatus) =>
                                updateCauseAndStatus(row.id, causeIndex, newValue, newStatus)
                            }
                            feedbacks={row.feedbacks}
                            activeColumns={activeColumns}
                            currentWorkingColumn={currentWorkingColumn}
                        />
                    </div>
                ))}
                {!isDone ? (
                    <div className='flex justify-center'>
                        <SubmitButton onClick={submitCauses} disabled={isLoading} label='Kirim Sebab' />
                    </div>
                ) : (
                    <div className='flex justify-center'>
                        <p className='text-green-600 font-bold'>Analisis akar masalah selesai!</p>
                    </div>
                )}
            </div>
        </MainLayout>
    );
}

export default ValidatorDetailPage;