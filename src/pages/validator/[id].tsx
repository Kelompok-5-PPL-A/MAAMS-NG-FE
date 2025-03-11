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
// import toast from 'react-hot-toast'
// import axiosInstance from '../../services/axiosInstance'

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
    const [validatorData] = useState<ValidatorData>(defaultValidatorData)
    const [columnCount, setColumnCount] = useState(3)
    const [rows, setRows] = useState<Rows[]>([createInitialRow(1, 3)])
    const [causes] = useState<Cause[]>([defaultCauses])
    const [canAdjustColumns] = useState(true)
    const [isLoading] = useState(false)
    const [isDone] = useState(false)

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
        // getQuestionData()
        // getCauses()  
    }, [id])

    useEffect(() => {
        // const update = updateRows(causes)
        // setRows(update)
        // increaseColumnCount(columnCount)
    }, [causes])
    

    useEffect(() => {
        // setRows(updateResolvedStatuses(rows))
    }, [rows.length])

    return (
        <MainLayout>
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
                        disabledCells={Array(columnCount).fill(true)}
                        onCauseAndStatusChanges={(causeIndex: number, newValue: string, newStatus: CauseStatus) =>
                            // updateCauseAndStatus(row.id, causeIndex, newValue, newStatus) 
                            {}
                        }
                        feedbacks={row.feedbacks}
                        />
                    </div>
                ))}
                {!isDone ? (
                    <div className='flex justify-center'>
                        <SubmitButton onClick={() => {/*submitCauses()*/}} disabled={isSubmitDisabled || isLoading} label='Kirim Sebab' />
                    </div>
                ) : (
                    <></>
                )}
            </div>
        </MainLayout>
    )
}

export default ValidatorDetailPage
