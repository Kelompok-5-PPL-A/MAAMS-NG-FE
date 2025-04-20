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
    const [activeColumns, setActiveColumns] = useState<number[]>([0, 1, 2]) // Mulai dengan 3 kolom pertama
    
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

    // Revisi logika isSubmitDisabled - button Kirim Sebab selalu aktif jika ada sel yang diisi dan belum divalidasi
    const isSubmitDisabled = (): boolean => {
        // Jika semua cause sudah divalidasi, disable tombol submit
        const allCausesValidated = rows.every(row => 
            row.causes.every((cause, colIndex) => 
                cause.trim() === '' || 
                row.statuses[colIndex] !== CauseStatus.Unchecked ||
                row.disabled[colIndex]
            )
        );
        
        if (allCausesValidated) {
            return true;
        }
        
        // Periksa jika ada cause yang belum divalidasi
        return !rows.some(row => 
            row.causes.some((cause, colIndex) => 
                cause.trim() !== '' && 
                row.statuses[colIndex] === CauseStatus.Unchecked && 
                !row.disabled[colIndex] && 
                isCellEditable(row.id, colIndex)
            )
        );
    }

    // Helper function untuk menentukan apakah sel dapat diedit
    const isCellEditable = (rowId: number, colIndex: number): boolean => {
        // Baris 1 - semua kolom awal aktif
        if (rowId === 1 && colIndex < 3) {
            return true;
        }
        
        // Untuk baris > 1
        if (rowId > 1) {
            // Hanya kolom yang aktif yang bisa diedit
            if (colIndex !== currentWorkingColumn) {
                return false;
            }
            
            // Periksa apakah baris sebelumnya di kolom ini valid tetapi bukan akar masalah
            const prevRowCause = causes.find(c => 
                c.row === rowId - 1 && c.column === colIndex
            );
            
            if (!prevRowCause || !prevRowCause.status || prevRowCause.root_status) {
                return false;
            }
            
            // Periksa jika semua kolom sebelumnya memiliki akar masalah
            const previousColumnsComplete = Array(colIndex)
                .fill(0)
                .map((_, i) => i)
                .every(prevCol => 
                    causes.some(cause => 
                        cause.column === prevCol && 
                        cause.root_status === true
                    )
                );
            
            return previousColumnsComplete;
        }
        
        return activeColumns.includes(colIndex);
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
            
            // Update kolom aktif dan working column berdasarkan akar masalah yang ditemukan
            const newActiveColumns = updateActiveColumns(causes)
            setActiveColumns(newActiveColumns)
            
            // Temukan kolom selanjutnya yang perlu dikerjakan
            const nextWorkingColumn = findNextWorkingColumn(causes)
            setCurrentWorkingColumn(nextWorkingColumn)
        }
    }, [causes])

    useEffect(() => {
        setRows(updateResolvedStatuses(rows))
    }, [rows.length])
    
    // Helper untuk menemukan kolom yang perlu dikerjakan selanjutnya
    const findNextWorkingColumn = (causesData: Cause[]): number => {
        // Jika baris 1 belum lengkap, fokus pada penyelesaian baris 1 dahulu
        const row1Causes = causesData.filter(cause => cause.row === 1 && cause.status);
        
        if (row1Causes.length < 3) {
            return 0; // Mulai dengan kolom 0
        }
        
        // Jika baris 1 lengkap, cari kolom pertama tanpa akar masalah
        for (let col = 0; col < columnCount; col++) {
            const hasRootCause = causesData.some(cause => 
                cause.column === col && cause.root_status === true
            );
            
            if (!hasRootCause) {
                return col;
            }
        }
        
        return 0; // Default ke kolom 0 jika semua kolom memiliki akar masalah
    };

    const createCausesFromRow = async (rowNumber: number) => {
        try {
          const row = rows.find((row) => row.id === rowNumber)
          if (!row) return

          // Untuk baris > 1, hanya buat causes untuk kolom yang sedang dikerjakan
          const createPromises = row.causes
            .map((cause, index) => ({ cause, index }))
            .filter(({ index, cause }) => {
                // Terapkan filter berbeda berdasarkan nomor baris
                if (row.id === 1) {
                    // Untuk baris 1, buat causes untuk semua kolom
                    return row.statuses[index] !== CauseStatus.Resolved && 
                           cause.trim() !== '' &&
                           activeColumns.includes(index) &&
                           row.statuses[index] === CauseStatus.Unchecked;
                } else {
                    // Untuk baris lainnya, hanya buat causes untuk kolom yang sedang dikerjakan
                    return row.statuses[index] !== CauseStatus.Resolved && 
                           cause.trim() !== '' &&
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
            // Terapkan filter berbeda berdasarkan nomor baris
            let shouldPatch = false;
            
            if (row.id === 1) {
                // Untuk baris 1, update semua kolom
                shouldPatch = row.statuses[index] !== CauseStatus.Resolved && 
                              cause.trim() !== '' && 
                              row.causesId[index] && 
                              activeColumns.includes(index) &&
                              row.statuses[index] === CauseStatus.Unchecked;
            } else {
                // Untuk baris lainnya, hanya update kolom yang sedang dikerjakan
                shouldPatch = row.statuses[index] !== CauseStatus.Resolved && 
                              cause.trim() !== '' && 
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
        if (!id) return [] // Return empty array instead of undefined
    
        try {
          const response = await axiosInstance.get(`/cause/${id}/`)
          const tempCauses: Cause[] = response.data ?? []
          if (tempCauses.length > 0) {
            setCauses(tempCauses)
            setCanAdjustColumns(false)
            return tempCauses // Make sure to return the causes
          } else {
            setRows([createInitialRow(1, 3)])
            return [] // Return empty array when no causes
          }
        } catch (error: any) {
          toast.error('Gagal mengambil sebab')
          return [] // Return empty array on error
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

    // Improved checkStatus untuk pendekatan kolom-per-kolom
    const checkStatus = (updatedRows: Rows[]): Rows[] => {
      // Periksa jika semua kolom aktif memiliki akar masalah
      const allActiveColumnsHaveRoot = activeColumns.every(column => {
          return causes.some(cause => 
              cause.column === column && cause.root_status === true
          );
      });

      if (allActiveColumnsHaveRoot) {
          setIsDone(true);
          return updatedRows;
      }

      // Temukan baris valid maksimum untuk kolom yang sedang dikerjakan
      const validRowsInCurrentColumn = causes
          .filter(cause => cause.column === currentWorkingColumn && cause.status === true)
          .map(cause => cause.row);
      
      const maxValidRow = validRowsInCurrentColumn.length > 0 
          ? Math.max(...validRowsInCurrentColumn) 
          : 0;
      
      // Periksa jika kolom yang sedang dikerjakan memiliki akar masalah
      const hasRootCause = causes.some(cause => 
          cause.column === currentWorkingColumn && cause.root_status === true
      );
      
      // Jika belum ada akar masalah dan kita memiliki baris valid, tambahkan baris baru
      if (!hasRootCause && maxValidRow > 0) {
          // Periksa jika kita sudah memiliki baris untuk level berikutnya
          const hasNextRow = updatedRows.some(row => row.id === maxValidRow + 1);
          
          if (!hasNextRow) {
              return addRow(updatedRows);
          }
      }

      return updatedRows;
    };

    const updateResolvedStatuses = (updatedRows: Rows[]): Rows[] => {
      const newRows = [...updatedRows];

      // Untuk setiap kolom, cari baris yang harus dinonaktifkan
      for (let col = 0; col < columnCount; col++) {
          // Periksa jika ada akar masalah di kolom ini
          const rootCauseRow = causes
              .filter(cause => cause.column === col && cause.root_status === true)
              .map(cause => cause.row)[0];
          
          if (rootCauseRow !== undefined) {
              // Nonaktifkan semua sel di kolom ini setelah baris akar masalah
              for (let index = 0; index < newRows.length; index++) {
                  if (newRows[index].id === rootCauseRow) continue; // Lewati baris akar masalah itu sendiri
                  
                  if (newRows[index].id > rootCauseRow) {
                      // Nonaktifkan sel setelah akar masalah
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
    
    // Helper function untuk menentukan kolom aktif
    const updateActiveColumns = (causesData: Cause[]): number[] => {
      // Minimal 3 kolom pertama selalu aktif untuk baris 1
      const minColumns = [0, 1, 2];
      
      // Untuk kolom berikutnya, kolom aktif jika semua kolom sebelumnya memiliki akar masalah
      const result = [...minColumns];
      
      for (let col = 3; col < columnCount; col++) {
          // Periksa jika semua kolom sebelumnya memiliki akar masalah
          const previousColumnsHaveRoots = Array(col)
              .fill(0)
              .map((_, i) => i)
              .every(prevCol => 
                  causesData.some(cause => cause.column === prevCol && cause.root_status === true)
              );
          
          if (previousColumnsHaveRoots) {
              result.push(col);
          } else {
              // Tidak perlu memeriksa kolom selanjutnya
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
        
        // Terapkan pendekatan kolom-per-kolom untuk menonaktifkan sel
        for (let colIndex = 0; colIndex < columnCount; colIndex++) {
            // Untuk baris 1, biarkan 3 kolom pertama aktif
            if (parseInt(rowNumber) === 1) {
                disabled[colIndex] = colIndex >= 3 ? true : (statuses[colIndex] !== CauseStatus.Unchecked);
            } else {
                // Untuk baris lainnya, hanya aktifkan kolom yang sedang dikerjakan
                // dan hanya jika baris sebelumnya di kolom ini valid dan bukan akar masalah
                const prevRowCause = causesData.find(c => 
                    c.row === parseInt(rowNumber) - 1 && c.column === colIndex
                );
                
                // Kolom aktif jika:
                // 1. Ini adalah kolom yang sedang dikerjakan 
                // 2. Baris sebelumnya valid dan bukan akar masalah
                // 3. Semua kolom sebelumnya memiliki akar masalah
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
                
                disabled[colIndex] = !isPrevRowValid || 
                                    hasRootInColumn || 
                                    !previousColumnsComplete || 
                                    colIndex !== currentWorkingColumn;
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
          
          // Tentukan baris mana yang perlu diproses
          const rowsToProcess = rows.filter(row => {
              if (row.id === 1) {
                  // Untuk baris 1, periksa semua sel di kolom aktif
                  return activeColumns.some(col => 
                      col < 3 && 
                      row.causes[col]?.trim() !== '' && 
                      row.statuses[col] === CauseStatus.Unchecked
                  );
              } else {
                  // Untuk baris > 1, hanya proses sel di kolom yang sedang dikerjakan
                  return row.causes[currentWorkingColumn]?.trim() !== '' && 
                         row.statuses[currentWorkingColumn] === CauseStatus.Unchecked;
              }
          });
          
          // Proses setiap baris
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
          
          // Perbarui kolom aktif dan kolom yang sedang dikerjakan berdasarkan cause terbaru
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
                          causesId={row.causesId}
                          causeStatuses={row.statuses}
                          disabledCells={row.disabled.map((disabled, index) => {
                              // Untuk baris 1, 3 kolom pertama selalu aktif
                              if (row.id === 1 && index < 3) {
                                  return disabled; // Gunakan status nonaktif yang dihitung di processedRows
                              }
                              
                              // Untuk baris selanjutnya, hanya aktifkan kolom yang sedang dikerjakan
                              // jika baris sebelumnya di kolom itu valid dan bukan akar masalah
                              if (row.id > 1) {
                                  // Apakah ini kolom yang sedang dikerjakan?
                                  if (index !== currentWorkingColumn) {
                                      return true; // Nonaktifkan semua kolom kecuali kolom yang sedang dikerjakan
                                  }
                                  
                                  // Periksa jika baris sebelumnya di kolom ini valid dan bukan akar masalah
                                  const prevRowCause = causes.find(c => 
                                      c.row === row.id - 1 && c.column === index
                                  );
                                  
                                  if (!prevRowCause || !prevRowCause.status || prevRowCause.root_status) {
                                      return true; // Nonaktifkan jika baris sebelumnya tidak valid atau adalah akar masalah
                                  }
                                  
                                  // Periksa jika kolom sebelumnya memiliki akar masalah yang belum terselesaikan
                                  const previousColumnsComplete = Array(index)
                                      .fill(0)
                                      .map((_, i) => i)
                                      .every(prevCol => 
                                          causes.some(cause => 
                                              cause.column === prevCol && 
                                              cause.root_status === true
                                          )
                                      );
                                  
                                  if (!previousColumnsComplete) {
                                      return true; // Nonaktifkan jika kolom sebelumnya belum memiliki akar masalah
                                  }
                                  
                                  return disabled; // Gunakan status nonaktif yang dihitung
                              }
                              
                              return disabled;
                          })}
                          onCauseAndStatusChanges={(causeIndex: number, newValue: string, newStatus: CauseStatus) =>
                              updateCauseAndStatus(row.id, causeIndex, newValue, newStatus)
                          }
                          feedbacks={row.feedbacks}
                      />
                  </div>
              ))}
              {!isDone ? (
                  <div className='flex justify-center'>
                      <SubmitButton onClick={submitCauses} disabled={isSubmitDisabled() || isLoading} label='Kirim Sebab' />
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