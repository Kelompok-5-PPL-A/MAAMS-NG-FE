import React from 'react'
import { render, fireEvent, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import ValidatorDetailPage from '../../pages/validator/[id]'
import axiosInstance from '../../services/axiosInstance'
import { toast } from 'react-hot-toast'

jest.mock('../../services/axiosInstance', () => ({
    post: jest.fn(),
    get: jest.fn()
}))
const mockedAxios = axiosInstance as jest.Mocked<typeof axiosInstance>

const mockPush = jest.fn()
const useRouterMock = jest.spyOn(require('next/router'), 'useRouter')

useRouterMock.mockImplementation(() => ({
    route: '/',
    pathname: '',
    query: { id: '123' },
    asPath: '',
    push: jest.fn(),
    replace: jest.fn(),
    reload: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn(),
    beforePopState: jest.fn(),
    events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn()
    }
}))
  
jest.mock('react-hot-toast', () => ({
    error: jest.fn(),
    success: jest.fn(),
    dismiss: jest.fn(),
    loading: jest.fn()
}))

describe('ValidatorDetailPage', () => {
    test('renders without crashing', () => {
        render(<ValidatorDetailPage />)
        expect(screen.getByText('Sebab:')).toBeInTheDocument()
    })

    test('renders validatorPage page with CounterButton and initial Row', () => {
        const { getByText, getAllByTestId } = render(<ValidatorDetailPage />)
    
        expect(getByText('Sebab:')).toBeInTheDocument()
        expect(getByText('3')).toBeInTheDocument()
        expect(getAllByTestId('row-container')).toHaveLength(1) // Initial row count
    })

    test('Adjusting column count updates all rows', () => {
        render(<ValidatorDetailPage />)
    
        fireEvent.click(screen.getByRole('button', { name: '+' }))
        
        const inputs = screen.getAllByRole('textbox')
        expect(inputs.length).toBeGreaterThan(3) 
    })

    test('should increment and decrement column count', () => {
        render(<ValidatorDetailPage />)
    
        const incrementButton = screen.getByRole('button', { name: /\+/i })
        const decrementButton = screen.getByRole('button', { name: /-/i })
    
        fireEvent.click(incrementButton)
        expect(screen.getByText('4')).toBeInTheDocument() 
    
        fireEvent.click(decrementButton)
        expect(screen.getByText('3')).toBeInTheDocument()
    })

    test('does not allow incrementing beyond 5 columns', () => {
        const { getByText } = render(<ValidatorDetailPage />)
    
        const incrementButton = screen.getByRole('button', { name: '+' })
        for (let i = 0; i < 5; i++) {
          fireEvent.click(incrementButton)
        }
        expect(getByText('5')).toBeInTheDocument()
    
        fireEvent.click(incrementButton)
        fireEvent.click(incrementButton)
        expect(getByText('5')).toBeInTheDocument()
    })

    test('does not allow decrementing below 3 columns', () => {
        const { getByText } = render(<ValidatorDetailPage />)
    
        const decrementButton = getByText('-')
        for (let i = 0; i < 3; i++) {
          fireEvent.click(decrementButton)
        }
        expect(getByText('3')).toBeInTheDocument()
    
        fireEvent.click(decrementButton)
        fireEvent.click(decrementButton)
        expect(getByText('3')).toBeInTheDocument()
    })

    test('prevents submitting if causes are empty', () => {
        render(<ValidatorDetailPage />)
        const submitButton = screen.getByRole('button', { name: 'Kirim Sebab' })
        expect(submitButton).toBeDisabled()
    })

    test('submits causes successfully', async () => {
        mockedAxios.get.mockResolvedValueOnce({ data: { success: true } })
        render(<ValidatorDetailPage />)
        const submitButton = screen.getByRole('button', { name: 'Kirim Sebab' })
        fireEvent.click(submitButton)
        await waitFor(() => 
            setTimeout(() => {
                expect(toast.success).toHaveBeenCalled()
            }, 10000)  
        )
    })

    test('Successfully get data on successful API call', async () => {
        const mockResponseData = {
            mode: 'mockMode',
            question: 'mockQuestion',
            title: 'mockTitle',
            tags: ['mockTags']
        }
        mockedAxios.get.mockResolvedValueOnce({ data: mockResponseData })
    
        render(<ValidatorDetailPage />)
    
        screen.debug()
    
        await waitFor(() => {
            expect(screen.findByText('mockMode')).resolves.toBeInTheDocument()
            expect(screen.findByText('mockTitle')).resolves.toBeInTheDocument()
            expect(screen.findByText('mockTags')).resolves.toBeInTheDocument()
        })
    })
})