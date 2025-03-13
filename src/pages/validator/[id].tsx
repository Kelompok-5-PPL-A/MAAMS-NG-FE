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
import { ValidatorQuestionForm } from '@/components/validatorQuestionForm'
// import { ValidatorAdminHeader } from '../../components/validatorAdminHeader'
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
  
const defaultCauses: Cause = {
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

interface Rows {
    id: number
    causes: any[]
    causesId: any[]
    statuses: any[]
    feedbacks: any[]
    disabled: any[]
}

function createInitialRow(id: number, cols: number) {
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

const ValidatorDetailPage = () => {
    const router = useRouter()
    const id = router.query.id
    const [validatorData, setValidatorData] = useState<ValidatorData>(defaultValidatorData)
    const [columnCount, setColumnCount] = useState(3)
    const [rows, setRows] = useState<Rows[]>([createInitialRow(1, 3)])
    const [causes, setCauses] = useState<Cause[]>([defaultCauses])
    const [canAdjustColumns, setCanAdjustColumns] = useState(true)
    const [isLoading, setIsLoading] = useState(false)
    const [isDone, setIsDone] = useState(false)

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

    const isSubmitDisabled = rows.some((row) =>
        row.causes.some((cause, index) => cause.trim() == '' && row.statuses[index] == CauseStatus.Unchecked)
    )

    useEffect(() => {
        getQuestionData()
        getCauses()  
    }, [id])

    const getQuestionData = async () => {
        if (!id) return
        try {
          const response = await axiosInstance.get(`/question/${id}`)
          const receivedData: ValidatorData = response.data
          setValidatorData(receivedData)
        } catch (error: any) {
          if (error.response) {
            toast.error(error.response.data.detail)
            router.push('/')
          } else {
            toast.error('Gagal mengambil data analisis')
            router.push('/')
          }
        }
    }
    
    const updateCauseAndStatus = (rowId: number, columnIndex: number, newCause: string, newStatus: CauseStatus) => {
    setRows((prevRows) =>
        prevRows.map((row) =>
        row.id === rowId
            ? {
                ...row,
                causes: row.causes.map((cause, index) => (index === columnIndex ? newCause : cause)),
                statuses: row.statuses.map((status, index) => (index === columnIndex ? newStatus : status))
            }
            : row
        )
    )
    }

    useEffect(() => {
        const update = updateRows(causes)
        setRows(update)
        increaseColumnCount(columnCount)
    }, [causes])
    

    useEffect(() => {
        setRows(updateResolvedStatuses(rows))
    }, [rows.length])

    const createCausesFromRow = async (rowNumber: number) => {
        try {
          const row = rows.find((row) => row.id === rowNumber)!
    
          const createPromises = row.causes
            .map((cause, index) => ({ cause, index }))
            .filter(({ index }) => row.statuses[index] !== CauseStatus.Resolved)
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
          toast.error('Gagal menambahkan sebab: ', error.response.data.detail)
        }
    }

    const patchCausesFromRow = async (rowNumber: number) => {
        const row = rows.find((row) => row.id === rowNumber)!

        const patchPromises = row.causes.map((cause, index) => {
            if (row.statuses[index] !== CauseStatus.Resolved) {
            return axiosInstance.patch(`/cause/patch/${id}/${row.causesId[index]}/`, { cause })
            }
        })

        await Promise.all(patchPromises)
    }

    const validateCauses = async () => {
        await axiosInstance.patch(`/cause/validate/${id}/`)
        toast.success('Sebab selesai divalidasi')
    }

    const getCauses = async () => {
        if (!id) return
    
        try {
          const response = await axiosInstance.get(`/cause/${id}/`)
          const tempCauses: Cause[] = response.data ?? []
          if (tempCauses.length > 0) {
            setCauses(tempCauses)
            setCanAdjustColumns(false)
          } else {
            setRows([createInitialRow(1, 3)])
          }
        } catch (error: any) {
          toast.error('Gagal mengambil sebab')
        }
    }

    const addRow = (updatedRows: typeof rows) => {
        return [...updatedRows, createInitialRow(updatedRows.length + 1, columnCount)]
    }

    const disableValidatedRow = (updatedRows: typeof rows) => {
        return updatedRows.map((row, index, arr) =>
          index < arr.length - 1
            ? {
                ...row,
                disabled: row.disabled.fill(true)
              }
            : row
        )
    }

    const checkStatus = (updatedRows: typeof rows) => {
        if (updatedRows.length >= 2) {
          const lastRow = updatedRows[updatedRows.length - 1].statuses.every(
            (status) => status === CauseStatus.CorrectRoot || status === CauseStatus.Resolved
          )
          if (lastRow) {
            setIsDone(true)
            return updatedRows
          }
        }
    
        const checkAllStatus = updatedRows.every((row) =>
          row.statuses.every(
            (status) =>
              status === CauseStatus.CorrectNotRoot || status === CauseStatus.CorrectRoot || status === CauseStatus.Resolved
          )
        )
        if (checkAllStatus) {
          updatedRows = addRow(updatedRows)
          updatedRows = disableValidatedRow(updatedRows)
        }
    
        return updatedRows
    }

    const updateResolvedStatuses = (updatedRows: typeof rows) => {
        const newRows = [...updatedRows]
    
        for (let index = 1; index < newRows.length; index++) {
          const prevRow = newRows[index - 1]
          const currentRow = newRows[index]
    
          const updatedStatuses = currentRow.statuses.map((status, colIndex) => {
            if (
              prevRow.statuses[colIndex] === CauseStatus.CorrectRoot ||
              prevRow.statuses[colIndex] === CauseStatus.Resolved
            ) {
              return CauseStatus.Resolved
            } else {
              return status
            }
          })
    
          const updatedCauses = currentRow.causes.map((cause, colIndex) => {
            if (updatedStatuses[colIndex] === CauseStatus.Resolved) {
              return ''
            } else {
              return cause
            }
          })
    
          const updatedDisabled = currentRow.disabled.map((isDisabled, colIndex) => {
            if (updatedStatuses[colIndex] === CauseStatus.Resolved) {
              return true
            }
            return isDisabled
          })
    
          newRows[index] = {
            ...currentRow,
            statuses: updatedStatuses,
            causes: updatedCauses,
            disabled: updatedDisabled
          }
        }
    
        return newRows
    }

    const processAndSetRows = (causes: Cause[]) => {
        const groupedCauses: { [key: number]: Cause[] } = {}
    
        Array.prototype.forEach.call(causes, (cause: Cause) => {
          const { row } = cause
          if (!groupedCauses[row]) {
            groupedCauses[row] = []
          }
          groupedCauses[row].push(cause)
        })
    
        const processedRows = Object.entries(groupedCauses).map(([rowNumber, rowCauses]) => {
          const causes = Array(columnCount).fill('')
          const causesId = Array(columnCount).fill('')
          const statuses = Array(columnCount).fill(CauseStatus.Unchecked)
          const feedbacks = Array(columnCount).fill('')
          const disabled = Array(columnCount).fill(false)
    
          rowCauses.forEach((cause) => {
            const colIndex = cause.column
            causes[colIndex] = cause.cause
            causesId[colIndex] = cause.id
            statuses[colIndex] = cause.root_status
              ? CauseStatus.CorrectRoot
              : cause.status
                ? CauseStatus.CorrectNotRoot
                : CauseStatus.Incorrect
            disabled[colIndex] = cause.status
            feedbacks[colIndex] = cause.feedback
          })
    
          return {
            id: parseInt(rowNumber),
            causes,
            causesId,
            statuses,
            feedbacks,
            disabled
          }
        })
    
        return processedRows
    }

    const updateRows = (cause: typeof causes) => {
        const tempRow = updateResolvedStatuses(processAndSetRows(cause))
        const columnCount = tempRow[0].causes.length
        setColumnCount(columnCount)
        return checkStatus(tempRow)
    }

    const submitCauses = async () => {
        try {
          setIsLoading(true)
          const loadID = toast.loading('Melakukan Analisis, Mohon Tunggu...')
          const largestRowId = Math.max(...rows.map((row) => row.id))
          const latestRow = rows.find((row) => row.id === largestRowId)
    
          if (latestRow) {
            const isFirstTime = latestRow.statuses.every(
              (status) => status === CauseStatus.Unchecked || status === CauseStatus.Resolved
            )
    
            if (isFirstTime) {
              await createCausesFromRow(largestRowId)
            } else {
              await patchCausesFromRow(largestRowId)
            }
          }
    
          await validateCauses()
          await getCauses()
          setIsLoading(false)
          toast.dismiss(loadID)
        } catch (error: any) {
          const errorMessage = error.response?.data?.detail || 'An unexpected error occurred'
          toast.error('Gagal validasi sebab: ', errorMessage)
          setIsLoading(false)
          toast.dismiss()
        }
    }


    return (
        <MainLayout>
            {/* <Toaster/> */}
            <div className='flex flex-col w-full gap-8'>
                
                {/* <ValidatorAdminHeader id={id} validatorData={validatorData} /> */}

                <ValidatorQuestionForm id={id} validatorData={validatorData} />
              
                <h1 className='text-2xl font-bold text-black'>Sebab:</h1>
               
                <CounterButton
                    number={columnCount}
                    onIncrement={() => adjustColumnCount(true)}
                    onDecrement={() => adjustColumnCount(false)}
                />
                    
                {rows.map((row) => (
                    <div key={row.id}>
                        <Row
                        rowNumber={row.id}
                        cols={columnCount}
                        causes={row.causes}
                        causesId={row.causesId}
                        causeStatuses={row.statuses}
                        disabledCells={Array(columnCount).fill(false)}
                        onCauseAndStatusChanges={(causeIndex: number, newValue: string, newStatus: CauseStatus) =>
                            updateCauseAndStatus(row.id, causeIndex, newValue, newStatus)
                        }
                        feedbacks={row.feedbacks}
                        />
                    </div>
                ))}
                {!isDone ? (
                    <div className='flex justify-center'>
                        <SubmitButton onClick={() => submitCauses()} disabled={isSubmitDisabled || isLoading} label='Kirim Sebab' />
                    </div>
                ) : (
                    <></>
                )}
            </div>
        </MainLayout>
    )
}

export default ValidatorDetailPage
