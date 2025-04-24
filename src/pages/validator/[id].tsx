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
    
    // State untuk menyimpan input user yang belum divalidasi
    const [pendingInputs, setPendingInputs] = useState<{ [key: string]: string }>({})
    
    // State to track cells with incorrect status that should remain editable
    const [incorrectCells, setIncorrectCells] = useState<Set<string>>(new Set())
    
    // Debug state
    const [debugMessages, setDebugMessages] = useState<string[]>([])
    
    const addDebugMessage = (message: string) => {
        console.log(message);
        setDebugMessages(prev => [...prev, message]);
    }
    
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

    // CRITICAL FIX: Modified to consider incorrect causes as valid inputs for submission
    const isSubmitDisabled = (): boolean => {
        if (isLoading) return true;
        
        // Check if there are any unvalidated or incorrect inputs that can be submitted
        const hasSubmittableInput = rows.some(row => {
            if (row.id === 1) {
                // For row 1, check columns A, B, C
                return row.causes.slice(0, 3).some((cause, index) => 
                    cause.trim() !== '' && 
                    (row.statuses[index] === CauseStatus.Unchecked || 
                     row.statuses[index] === CauseStatus.Incorrect)
                );
            }
            
            // For other rows, check the current working column
            return row.causes[currentWorkingColumn]?.trim() !== '' && 
                   (row.statuses[currentWorkingColumn] === CauseStatus.Unchecked || 
                    row.statuses[currentWorkingColumn] === CauseStatus.Incorrect);
        });
        
        // Submit is disabled if there are NO submittable inputs
        return !hasSubmittableInput;
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
    
    const updateCauseAndStatus = (rowId: number, columnIndex: number, newValue: string, newStatus: CauseStatus) => {
        // Save user input separately from validated data
        const key = `${rowId}-${columnIndex}`;
        
        // Debug logging for inputs in current working column
        if (columnIndex === currentWorkingColumn) {
            const columnLabel = ['A', 'B', 'C', 'D', 'E'][columnIndex];
            addDebugMessage(`${columnLabel}${rowId} input update: "${newValue}"`);
        }
        
        setPendingInputs(prev => ({
            ...prev,
            [key]: newValue
        }));
        
        const updateRow = (row: Rows): Rows => {
            if (row.id !== rowId) return row;
            
            const updatedCauses = [...row.causes];
            updatedCauses[columnIndex] = newValue;
            
            const updatedStatuses = [...row.statuses];
            // Only update status if user clears input
            if (newValue.trim() === '') {
                updatedStatuses[columnIndex] = CauseStatus.Unchecked;
            }
            
            // FIX: Clear any default feedback when user enters input - this prevents showing premature feedback
            const updatedFeedbacks = [...row.feedbacks];
            // Only clear feedback for cells that haven't been validated yet or are incorrect
            if (updatedStatuses[columnIndex] === CauseStatus.Unchecked || 
                updatedStatuses[columnIndex] === CauseStatus.Incorrect) {
                updatedFeedbacks[columnIndex] = '';
            }
            
            return {
                ...row,
                causes: updatedCauses,
                statuses: updatedStatuses,
                feedbacks: updatedFeedbacks
            };
        };
        
        setRows(prevRows => prevRows.map(updateRow));
        
        // Track this cell as an incorrect cell that should remain editable
        if (newStatus === CauseStatus.Incorrect) {
            setIncorrectCells(prev => {
                const newSet = new Set(prev);
                newSet.add(key);
                return newSet;
            });
        }
    }

    useEffect(() => {
        if (causes.length > 0 && causes[0].id !== '') {
            // Update rows with validated data
            const update = updateRows(causes)
            
            // Apply pending inputs that haven't been validated
            const rowsWithPendingInputs = update.map(row => {
                const updatedRow = { ...row };
                for (let colIndex = 0; colIndex < columnCount; colIndex++) {
                    const key = `${row.id}-${colIndex}`;
                    if (pendingInputs[key] !== undefined) {
                        // For cells with incorrect status or unchecked, always use pending input if it exists
                        if (updatedRow.statuses[colIndex] === CauseStatus.Incorrect || 
                            updatedRow.statuses[colIndex] === CauseStatus.Unchecked) {
                            updatedRow.causes[colIndex] = pendingInputs[key];
                            
                            // FIX: Clear any feedback for cells with user input that aren't validated yet
                            if (pendingInputs[key].trim() !== '') {
                                updatedRow.feedbacks[colIndex] = '';
                            }
                        }
                    }
                }
                return updatedRow;
            });
            
            setRows(rowsWithPendingInputs);
            increaseColumnCount(columnCount);
            
            const newActiveColumns = updateActiveColumns(causes);
            setActiveColumns(newActiveColumns);
            
            const nextWorkingColumn = findNextWorkingColumn(causes);
            setCurrentWorkingColumn(nextWorkingColumn);
            
            // Check if all analysis is complete
            const allColumnsHaveRoot = newActiveColumns.every(col => 
                causes.some(cause => cause.column === col && cause.root_status === true)
            );
            
            if (allColumnsHaveRoot) {
                setIsDone(true);
            }
        }
    }, [causes, pendingInputs])

    const findNextWorkingColumn = (causesData: Cause[]): number => {
        // Check if all row 1 causes are complete (minimum 3 columns)
        const row1Causes = causesData.filter(cause => cause.row === 1 && cause.status);
        
        if (row1Causes.length < 3) {
            return 0; // Still need to complete first row
        }
        
        // Find the first column without a root cause
        for (let col = 0; col < columnCount; col++) {
            // Check if this column is active
            if (!activeColumns.includes(col)) continue;
            
            const hasRootCause = causesData.some(cause => 
                cause.column === col && cause.root_status === true
            );
            
            if (!hasRootCause) {
                // Debug log when column changes
                const columnLabel = ['A', 'B', 'C', 'D', 'E'][col];
                addDebugMessage(`Column ${columnLabel} is now the working column`);
                return col;
            }
        }
        
        return 0; // Default to first column if all are complete
    };

    // CRITICAL FIX: Modified to handle all rows in the current column correctly
    const createCausesFromRow = async (rowNumber: number) => {
        try {
            const row = rows.find((row) => row.id === rowNumber)
            if (!row) return
            
            // Log attempt to create causes for this row
            const columnLabel = ['A', 'B', 'C', 'D', 'E'][currentWorkingColumn];
            addDebugMessage(`Attempting to create cause for ${columnLabel}${rowNumber}: "${row.causes[currentWorkingColumn]}"`);

            // Check for all previous rows for current column
            if (rowNumber > 1) {
                // Check if previous row for this column is valid
                const prevRowValid = causes.some(c => 
                    c.column === currentWorkingColumn && 
                    c.row === rowNumber - 1 && 
                    c.status === true
                );
                
                if (prevRowValid) {
                    addDebugMessage(`Previous row ${columnLabel}${rowNumber-1} is valid, proceeding with ${columnLabel}${rowNumber}`);
                } else {
                    addDebugMessage(`Warning: Previous row ${columnLabel}${rowNumber-1} is not valid, but attempting to create ${columnLabel}${rowNumber} anyway`);
                }
            }

            const createPromises = row.causes
                .map((cause, index) => ({ cause, index }))
                .filter(({ index, cause }) => {
                    // Debug logging for current column
                    if (index === currentWorkingColumn && cause.trim() !== '') {
                        const colLabel = ['A', 'B', 'C', 'D', 'E'][index];
                        const isValid = (row.statuses[index] === CauseStatus.Unchecked || 
                                         row.statuses[index] === CauseStatus.Incorrect);
                        
                        addDebugMessage(`${colLabel}${rowNumber} filter check: cause="${cause}", valid=${isValid}`);
                        addDebugMessage(`${colLabel}${rowNumber} status: ${row.statuses[index]}, trimmed: "${cause.trim()}"`);
                    }
                
                    if (rowNumber === 1) {
                        // For row 1, only send columns A, B, C that can be validated
                        return index < 3 && 
                               cause.trim() !== '' &&
                               (row.statuses[index] === CauseStatus.Unchecked || 
                                row.statuses[index] === CauseStatus.Incorrect);
                    } else {
                        // For all other rows in the current working column
                        return cause.trim() !== '' &&
                               index === currentWorkingColumn &&
                               (row.statuses[index] === CauseStatus.Unchecked || 
                                row.statuses[index] === CauseStatus.Incorrect);
                    }
                })
                .map(({ cause, index }) => {
                    // Log the data being sent to the server
                    const colLabel = ['A', 'B', 'C', 'D', 'E'][index];
                    addDebugMessage(`Sending ${colLabel}${rowNumber} data to server: "${cause}"`);
                    
                    return {
                        question_id: id,
                        cause: cause,
                        row: rowNumber,
                        column: index,
                        mode: validatorData.mode
                    };
                })
                .map((data) => {
                    // Final logging before API call
                    return axiosInstance.post(`/cause/`, data);
                });
                
            if (createPromises.length === 0) {
                addDebugMessage(`No causes to create for row ${rowNumber} - empty promises array`);
            } else {
                addDebugMessage(`Creating ${createPromises.length} new causes for row ${rowNumber}`);
            }
    
            await Promise.all(createPromises);
        } catch (error: any) {
            toast.error('Gagal menambahkan sebab: ' + (error.response?.data?.detail || error.message));
            addDebugMessage(`Error creating causes: ${error.message}`);
        }
    }

    // CRITICAL FIX: Modified to handle all rows correctly
    const patchCausesFromRow = async (rowNumber: number) => {
        const row = rows.find((row) => row.id === rowNumber)
        if (!row) return

        // Debug for current row
        const columnLabel = ['A', 'B', 'C', 'D', 'E'][currentWorkingColumn];
        addDebugMessage(`Attempting to patch ${columnLabel}${rowNumber}, cause="${row.causes[currentWorkingColumn]}", id=${row.causesId[currentWorkingColumn]}`);
        
        const patchPromises = row.causes.map((cause, index) => {
            let shouldPatch = false;
            
            // Debug logging for current column
            if (index === currentWorkingColumn) {
                const colLabel = ['A', 'B', 'C', 'D', 'E'][index];
                addDebugMessage(`Checking if ${colLabel}${rowNumber} should be patched:`);
                addDebugMessage(`- cause: "${cause}"`);
                addDebugMessage(`- has ID: ${!!row.causesId[index]}`);
                addDebugMessage(`- status: ${row.statuses[index]}`);
            }
            
            if (row.id === 1) {
                shouldPatch = index < 3 && 
                              cause.trim() !== '' && 
                              !!row.causesId[index] &&
                              (row.statuses[index] === CauseStatus.Unchecked || 
                               row.statuses[index] === CauseStatus.Incorrect);
            } else {
                // All other rows: if there's a valid ID and it's in the current working column
                shouldPatch = cause.trim() !== '' && 
                              !!row.causesId[index] &&
                              index === currentWorkingColumn &&
                              (row.statuses[index] === CauseStatus.Unchecked || 
                               row.statuses[index] === CauseStatus.Incorrect);
            }
            
            if (shouldPatch) {
                if (index === currentWorkingColumn) {
                    const colLabel = ['A', 'B', 'C', 'D', 'E'][index];
                    addDebugMessage(`Patching ${colLabel}${rowNumber} with value: "${cause}"`);
                }
                return axiosInstance.patch(`/cause/patch/${id}/${row.causesId[index]}/`, { cause });
            }
            return null;
        }).filter(promise => promise !== null);

        if (patchPromises.length === 0) {
            addDebugMessage(`No causes to patch for row ${rowNumber} - empty promises array`);
        }
        
        await Promise.all(patchPromises);
    }

    // CRITICAL FIX: Modified validateCauses to ensure proper validation
    const validateCauses = async () => {
        try {
            addDebugMessage("Validating causes...");
            
            // Check if we have any rows pending for validation in current column
            const hasPendingRows = rows.some(row => 
                row.causes[currentWorkingColumn]?.trim() !== '' && 
                (row.statuses[currentWorkingColumn] === CauseStatus.Unchecked || 
                 row.statuses[currentWorkingColumn] === CauseStatus.Incorrect)
            );
            
            if (hasPendingRows) {
                const columnLabel = ['A', 'B', 'C', 'D', 'E'][currentWorkingColumn];
                const pendingRows = rows.filter(row => 
                    row.causes[currentWorkingColumn]?.trim() !== '' && 
                    (row.statuses[currentWorkingColumn] === CauseStatus.Unchecked || 
                     row.statuses[currentWorkingColumn] === CauseStatus.Incorrect)
                );
                
                pendingRows.forEach(row => {
                    addDebugMessage(`${columnLabel}${row.id} is pending validation with text: "${row.causes[currentWorkingColumn]}"`);
                });
            }
            
            const response = await axiosInstance.patch(`/cause/validate/${id}/`);
            
            // Check response content
            if (response?.data && Array.isArray(response.data)) {
                addDebugMessage(`Received validation response with ${response.data.length} causes`);
                
                // Check for this column's rows in the response
                const columnLabel = ['A', 'B', 'C', 'D', 'E'][currentWorkingColumn];
                const rowsInResponse = response.data.filter(c => c.column === currentWorkingColumn);
                
                rowsInResponse.forEach(cause => {
                    addDebugMessage(`${columnLabel}${cause.row} in response: "${cause.cause}", status: ${cause.status}, feedback: "${cause.feedback}"`);
                });
                
                if (rowsInResponse.length === 0) {
                    addDebugMessage(`No rows for column ${columnLabel} found in validation response`);
                }
                
                // Replace causes directly with new data
                setCauses(response.data);
            } else {
                addDebugMessage("No data in validation response, refreshing causes");
                // If no direct data, refresh causes
                await getCauses();
            }
            toast.success('Sebab selesai divalidasi');
        } catch (error: any) {
            toast.error('Gagal validasi sebab');
            addDebugMessage(`Error in validateCauses: ${error.message}`);
            // Still try to refresh causes data
            await getCauses();
        }
    }

    const getCauses = async (): Promise<Cause[]> => {
        if (!id) return []
    
        try {
          const response = await axiosInstance.get(`/cause/${id}/`)
          const tempCauses: Cause[] = response.data ?? []
          
          // Debug response data
          addDebugMessage(`Received ${tempCauses.length} causes from server`);
          
          // Get the maximum row number for the current column
          const currentColCauses = tempCauses.filter(c => c.column === currentWorkingColumn);
          if (currentColCauses.length > 0) {
              const maxRow = Math.max(...currentColCauses.map(c => c.row));
              const colLabel = ['A', 'B', 'C', 'D', 'E'][currentWorkingColumn];
              addDebugMessage(`Current column ${colLabel} has ${currentColCauses.length} causes, max row: ${maxRow}`);
              
              // Log status of all rows in the column
              for (let row = 1; row <= maxRow; row++) {
                  const rowCause = currentColCauses.find(c => c.row === row);
                  if (rowCause) {
                      addDebugMessage(`${colLabel}${row} from server: "${rowCause.cause}", status: ${rowCause.status}, feedback: "${rowCause.feedback}"`);
                  } else {
                      addDebugMessage(`${colLabel}${row} not found in server response`);
                  }
              }
          }
          
          if (tempCauses.length > 0) {
            // Only clear pending inputs for successfully validated causes
            // (those with status=true)
            const newPendingInputs = { ...pendingInputs };
            tempCauses.forEach(cause => {
                const key = `${cause.row}-${cause.column}`;
                if (cause.status && newPendingInputs[key]) {
                    delete newPendingInputs[key];
                }
                
                // Track incorrect cells to ensure they remain editable
                if (!cause.status) {
                    setIncorrectCells(prev => {
                        const newSet = new Set(prev);
                        newSet.add(key);
                        return newSet;
                    });
                }
            });
            setPendingInputs(newPendingInputs);
            
            setCauses(tempCauses);
            setCanAdjustColumns(false);
            return tempCauses;
          } else {
            setRows([createInitialRow(1, 3)]);
            return [];
          }
        } catch (error: any) {
          toast.error('Gagal mengambil sebab');
          addDebugMessage(`Error in getCauses: ${error.message}`);
          return [];
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
        const newRow = createInitialRow(updatedRows.length + 1, columnCount);
        
        // Only the current working column is enabled in the new row
        for (let i = 0; i < columnCount; i++) {
            newRow.disabled[i] = i !== currentWorkingColumn;
        }
        
        return [...updatedRows, newRow];
    }

    const checkStatus = (updatedRows: Rows[]): Rows[] => {
        // Check if we need to add a new row for the current working column
        const validRowsInCurrentColumn = causes
            .filter(cause => cause.column === currentWorkingColumn && cause.status === true)
            .map(cause => cause.row);
        
        const maxValidRow = validRowsInCurrentColumn.length > 0 
            ? Math.max(...validRowsInCurrentColumn) 
            : 0;
        
        const hasRootCause = causes.some(cause => 
            cause.column === currentWorkingColumn && cause.root_status === true
        );
        
        // Add a new row if the last row is valid and there's no root cause yet
        if (!hasRootCause && maxValidRow > 0) {
            const hasNextRow = updatedRows.some(row => row.id === maxValidRow + 1);
            
            if (!hasNextRow) {
                const columnLabel = ['A', 'B', 'C', 'D', 'E'][currentWorkingColumn];
                addDebugMessage(`Adding row ${maxValidRow + 1} to column ${columnLabel} since row ${maxValidRow} is valid and no root cause yet`);
                return addRow(updatedRows);
            }
        }
  
        return updatedRows;
    };
  
    const updateActiveColumns = (causesData: Cause[]): number[] => {
        // Always keep the first three columns active
        const result = [0, 1, 2];
        
        // Add next columns if previous columns have root causes
        for (let col = 3; col < columnCount; col++) {
            const previousColumnsHaveRoots = Array(col)
                .fill(0)
                .map((_, i) => i)
                .every(prevCol => 
                    causesData.some(cause => cause.column === prevCol && cause.root_status === true)
                );
            
            if (previousColumnsHaveRoots) {
                result.push(col);
            }
        }
        
        return result;
    };
    
    const processAndSetRows = (causesData: Cause[]): Rows[] => {
        // Group all causes by row number
        const groupedCauses: { [key: number]: Cause[] } = {};
        causesData.forEach((cause) => {
            const { row } = cause;
            if (!groupedCauses[row]) {
                groupedCauses[row] = [];
            }
            groupedCauses[row].push(cause);
        });
        
        // Find the maximum row in the data
        const maxRow = Math.max(...causesData.map(cause => cause.row), 1);
        const columnLabel = ['A', 'B', 'C', 'D', 'E'][currentWorkingColumn];
        addDebugMessage(`Processing rows: max row is ${maxRow}, current column is ${columnLabel}`);
        
        // Create array with all necessary rows
        const processedRows: Rows[] = [];
        
        // Special case: we need to check if we need rows for any columns
        // Check which columns have valid preceding rows
        const columnsWithValidPrevRow = new Map<number, number>();
        for (let col = 0; col < columnCount; col++) {
            // For each column, find the maximum valid row
            const validRowsInColumn = causesData
                .filter(c => c.column === col && c.status === true)
                .map(c => c.row);
            
            if (validRowsInColumn.length > 0) {
                const maxValidRow = Math.max(...validRowsInColumn);
                columnsWithValidPrevRow.set(col, maxValidRow);
                
                // Check if this column has a root cause
                const hasRootCause = causesData.some(c => 
                    c.column === col && c.root_status === true
                );
                
                if (!hasRootCause) {
                    const colLabel = ['A', 'B', 'C', 'D', 'E'][col];
                    addDebugMessage(`Column ${colLabel} has valid row up to ${maxValidRow} but no root cause yet`);
                }
            }
        }
        
        // Process existing rows
        for (let rowNum = 1; rowNum <= maxRow; rowNum++) {
            const rowCauses = groupedCauses[rowNum] || [];
            const causes = Array(columnCount).fill('');
            const causesId = Array(columnCount).fill('');
            const statuses = Array(columnCount).fill(CauseStatus.Unchecked);
            const feedbacks = Array(columnCount).fill('');
            const disabled = Array(columnCount).fill(false);
            
            // Fill in data from existing causes
            rowCauses.forEach((cause) => {
                const colIndex = cause.column;
                causes[colIndex] = cause.cause;
                causesId[colIndex] = cause.id;
                statuses[colIndex] = getStatusValue(cause);
                
                // FIX: Only add feedback for validated causes that have feedback
                // This prevents showing feedback for empty next cells
                if ((statuses[colIndex] === CauseStatus.CorrectRoot || 
                     statuses[colIndex] === CauseStatus.CorrectNotRoot || 
                     statuses[colIndex] === CauseStatus.Incorrect) && 
                    cause.feedback) {
                    feedbacks[colIndex] = cause.feedback;
                }
            });
            
            // Determine which cells should be disabled
            for (let colIndex = 0; colIndex < columnCount; colIndex++) {
                if (causes[colIndex].trim() === '') {
                    statuses[colIndex] = CauseStatus.Unchecked;
                    feedbacks[colIndex] = '';
                }

                const key = `${rowNum}-${colIndex}`;
                const colLabel = ['A', 'B', 'C', 'D', 'E'][colIndex];
                
                // CRITICAL FIX: Special handling for any row in the current working column
                if (colIndex === currentWorkingColumn) {
                    // For the current working column, we need to check if previous row is valid
                    if (rowNum === 1 || (rowNum > 1 && causesData.some(c => 
                        c.column === colIndex && 
                        c.row === rowNum - 1 && 
                        c.status === true && 
                        !c.root_status
                    ))) {
                        // Row 1 or rows with valid previous row should be editable
                        disabled[colIndex] = false;
                        
                        // Special debug for row > 2
                        if (rowNum > 2) {
                            addDebugMessage(`${colLabel}${rowNum} set to editable because ${colLabel}${rowNum-1} is valid`);
                        }
                        continue;
                    }
                }
                
                // Only disable validated cells with correct status
                // Cells with incorrect status should remain editable
                if (statuses[colIndex] === CauseStatus.CorrectNotRoot || 
                    statuses[colIndex] === CauseStatus.CorrectRoot) {
                    disabled[colIndex] = true;
                    continue;
                }
                
                // Ensure incorrect cells are explicitly kept editable
                if (statuses[colIndex] === CauseStatus.Incorrect || 
                    incorrectCells.has(key)) {
                    disabled[colIndex] = false;
                    continue;
                }
                
                if (rowNum === 1) {
                    // For row 1, only columns A, B, C are editable
                    if (colIndex >= 3) {
                        disabled[colIndex] = true;
                    }
                } else {
                    // For other rows:
                    // 1. If column has a root cause, disable all rows after the root
                    // 2. Only enable the current working column
                    // 3. Must have a valid cause in the previous row
                    
                    const hasRootInColumn = causesData.some(c => 
                        c.column === colIndex && c.root_status === true
                    );
                    
                    if (hasRootInColumn) {
                        const rootRow = causesData.find(c => 
                            c.column === colIndex && c.root_status === true
                        )?.row || 0;
                        
                        if (rowNum > rootRow) {
                            disabled[colIndex] = true;
                            continue;
                        }
                    }

                    // Check if the previous row has a valid cause
                    const prevRowValid = causesData.some(c => 
                        c.column === colIndex && 
                        c.row === rowNum - 1 && 
                        c.status === true
                    );
                    
                    // For rows > 1 in current working column with valid previous row, enable
                    if (colIndex === currentWorkingColumn && prevRowValid) {
                        disabled[colIndex] = false;
                    } else {
                        disabled[colIndex] = true;
                    }
                }
                
                // FIX: Clear placeholder feedback for empty cells
                // This prevents showing feedback for cells without user input
                if (!disabled[colIndex] && causes[colIndex].trim() === '') {
                    feedbacks[colIndex] = '';
                }
            }
            
            processedRows.push({
                id: rowNum,
                causes,
                causesId,
                statuses,
                feedbacks,
                disabled
            });
        }
        
        // Create first row if no rows exist
        if (processedRows.length === 0) {
            return [createInitialRow(1, columnCount)];
        }
        
        // Check if we need to add a new row at the end for the current working column
        if (columnsWithValidPrevRow.has(currentWorkingColumn)) {
            const maxValidRow = columnsWithValidPrevRow.get(currentWorkingColumn)!;
            
            // Check if we already have the next row
            const hasNextRow = maxValidRow + 1 <= maxRow;
            
            // Check if this column has a root cause already
            const hasRootCause = causesData.some(c => 
                c.column === currentWorkingColumn && c.root_status === true
            );
            
            // If no root cause yet and no next row, add one
            if (!hasRootCause && !hasNextRow) {
                const newRow = createInitialRow(maxValidRow + 1, columnCount);
                
                // Only the current working column is enabled in the new row
                for (let i = 0; i < columnCount; i++) {
                    newRow.disabled[i] = i !== currentWorkingColumn;
                }
                
                // FIX: Ensure the new row has empty feedback
                newRow.feedbacks[currentWorkingColumn] = '';
                
                const colLabel = ['A', 'B', 'C', 'D', 'E'][currentWorkingColumn];
                addDebugMessage(`Added new ${colLabel}${maxValidRow + 1} row to UI and made it editable`);
                
                processedRows.push(newRow);
            }
        }
        
        return processedRows;
    };
    
    const updateRows = (causesData: Cause[]): Rows[] => {
        const tempRows = processAndSetRows(causesData);
        const colCount = tempRows.length > 0 ? tempRows[0].causes.length : 3;
        setColumnCount(colCount);
        
        return checkStatus(tempRows);
    };
    
    const submitCauses = async () => {
        try {
            setIsLoading(true);
            const loadID = toast.loading('Melakukan Analisis, Mohon Tunggu...');
            
            // Log which causes are about to be processed
            addDebugMessage("===== Beginning submit causes =====");
            rows.forEach(row => {
                if (row.causes[currentWorkingColumn]?.trim() !== '') {
                    const columnLabel = ['A', 'B', 'C', 'D', 'E'][currentWorkingColumn];
                    addDebugMessage(`Row ${row.id}, Col ${columnLabel}: "${row.causes[currentWorkingColumn]}", Status: ${row.statuses[currentWorkingColumn]}, Disabled: ${row.disabled[currentWorkingColumn]}`);
                }
            });
            
            // CRITICAL FIX: Modified to ensure all rows in current column are processed correctly
            // Filter rows with unvalidated input or incorrect causes
            const rowsToProcess = rows.filter(row => {
                if (row.id === 1) {
                    // For row 1, process columns A, B, C
                    return row.causes.slice(0, 3).some((cause, index) => 
                        cause.trim() !== '' && 
                        (row.statuses[index] === CauseStatus.Unchecked || 
                         row.statuses[index] === CauseStatus.Incorrect)
                    );
                }
                
                // For other rows, only process the current working column if:
                // 1. It has content
                // 2. It's either unvalidated or incorrect
                // 3. It's not disabled
                return row.causes[currentWorkingColumn]?.trim() !== '' && 
                       (row.statuses[currentWorkingColumn] === CauseStatus.Unchecked || 
                        row.statuses[currentWorkingColumn] === CauseStatus.Incorrect) &&
                       !row.disabled[currentWorkingColumn];
            });
            
            // Log all rows that will be processed
            addDebugMessage(`Processing ${rowsToProcess.length} rows`);
            rowsToProcess.forEach(row => {
                const columnLabel = ['A', 'B', 'C', 'D', 'E'][currentWorkingColumn];
                addDebugMessage(`Will process row ${row.id} with ${columnLabel}${row.id}: "${row.causes[currentWorkingColumn]}"`);
            });
            
            // Process each row
            for (const row of rowsToProcess) {
                // Check if this is a new row or has existing IDs
                const rowHasIds = row.causesId.some(id => !!id);
                
                if (!rowHasIds) {
                    // For new rows, create new causes
                    addDebugMessage(`Creating new causes for row ${row.id}`);
                    await createCausesFromRow(row.id);
                } else {
                    // For existing rows, update causes
                    addDebugMessage(`Updating existing causes for row ${row.id}`);
                    await patchCausesFromRow(row.id);
                }
            }
            
            // Validate all newly entered or updated causes
            addDebugMessage("About to call validateCauses()");
            await validateCauses();
            
            // Update active columns based on validation results
            const updatedCauses = await getCauses();
            const newActiveColumns = updateActiveColumns(updatedCauses);
            setActiveColumns(newActiveColumns);
            
            // Determine which column to work on next
            const nextWorkingColumn = findNextWorkingColumn(updatedCauses);
            setCurrentWorkingColumn(nextWorkingColumn);
            
            // Update processing state
            setIsLoading(false);
            toast.dismiss(loadID);
        } catch (error: any) {
            const errorMessage = error.response?.data?.detail || 'An unexpected error occurred';
            toast.error('Gagal validasi sebab: ' + errorMessage);
            addDebugMessage(`Error in submitCauses: ${errorMessage}`);
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
                        <SubmitButton 
                            onClick={submitCauses} 
                            disabled={isSubmitDisabled()} 
                            label={isLoading ? 'Menganalisis...' : 'Kirim Sebab'} 
                        />
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