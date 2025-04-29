import React from 'react'
import { render, screen, fireEvent, within } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Row } from '../../components/row'
import { CauseStatus } from '../../lib/enum'

// Mock the Cell component to control its behavior and isolate Row tests
const mockCellComponent = jest.fn(({ cellName, cause, onChange, causeStatus, disabled, placeholder, feedback }) => (
    <div data-testid="cell" className="mocked-cell">
      <div>{cellName}</div>
      <textarea
        value={cause}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={disabled ? "" : placeholder}
        data-testid="cell-textarea"
        className={`border ${
          causeStatus === 'CorrectRoot'
            ? 'border-purple-500'
            : causeStatus === 'CorrectNotRoot'
            ? 'border-green-500'
            : causeStatus === 'Incorrect'
            ? 'border-red-500'
            : causeStatus === 'Resolved'
            ? 'border-gray-200'
            : 'border-black'
        }`}
      />
      <div data-testid="feedback">
        {feedback && causeStatus === 'CorrectRoot' && `☑️ ${feedback} Akar Masalah Kolom ${cellName[0]} ditemukan`}
        {feedback && causeStatus === 'CorrectNotRoot' && `✅ ${feedback}`}
        {feedback && causeStatus === 'Incorrect' && `❌ ${feedback}`}
        {feedback && causeStatus === 'Unchecked' && feedback}
      </div>
    </div>
  )
)

describe('Row Component', () => {
    // Reset the Cell mock after each test
    afterEach(() => {
      jest.clearAllMocks()
    })
  
    // Default props for most tests
    const defaultProps = {
      rowNumber: 1,
      cols: 3,
      causes: ['Cause 1', 'Cause 2', 'Cause 3'],
      causeStatuses: [CauseStatus.Unchecked, CauseStatus.Unchecked, CauseStatus.Unchecked],
      disabledCells: [false, false, false],
      feedbacks: ['Feedback 1', 'Feedback 2', 'Feedback 3'],
      onCauseAndStatusChanges: jest.fn(),
      activeColumns: [0, 1, 2],
      currentWorkingColumn: 0
    }
  
    test('renders correctly with the given number of columns', () => {
      render(<Row {...defaultProps} />)
      expect(screen.getByTestId('row-container')).toHaveClass('grid grid-cols-3')
      const cellElements = screen.getAllByTestId('cell')
      expect(cellElements).toHaveLength(3)
    })
  
    test('renders with grid-cols-4 when cols is 4', () => {
      const props = {
        ...defaultProps,
        cols: 4,
        causes: ['Cause 1', 'Cause 2', 'Cause 3', 'Cause 4'],
        causeStatuses: [CauseStatus.Unchecked, CauseStatus.Unchecked, CauseStatus.Unchecked, CauseStatus.Unchecked],
        disabledCells: [false, false, false, false],
        feedbacks: ['Feedback 1', 'Feedback 2', 'Feedback 3', 'Feedback 4']
      }
      render(<Row {...props} />)
      expect(screen.getByTestId('row-container')).toHaveClass('grid grid-cols-4')
      const cellElements = screen.getAllByTestId('cell')
      expect(cellElements).toHaveLength(4)
    })
  
    test('renders with grid-cols-5 when cols is 5', () => {
      const props = {
        ...defaultProps,
        cols: 5,
        causes: ['Cause 1', 'Cause 2', 'Cause 3', 'Cause 4', 'Cause 5'],
        causeStatuses: [CauseStatus.Unchecked, CauseStatus.Unchecked, CauseStatus.Unchecked, CauseStatus.Unchecked, CauseStatus.Unchecked],
        disabledCells: [false, false, false, false, false],
        feedbacks: ['Feedback 1', 'Feedback 2', 'Feedback 3', 'Feedback 4', 'Feedback 5']
      }
      render(<Row {...props} />)
      expect(screen.getByTestId('row-container')).toHaveClass('grid grid-cols-5')
      const cellElements = screen.getAllByTestId('cell')
      expect(cellElements).toHaveLength(5)
    })
  
    test('does not render when cols is less than 3', () => {
      const props = { ...defaultProps, cols: 2 }
      const { container } = render(<Row {...props} />)
      expect(screen.queryByTestId('row-container')).not.toBeInTheDocument()
      expect(container.firstChild).toBeEmptyDOMElement()
    })
  
    test('does not render when cols is greater than 5', () => {
      const props = { ...defaultProps, cols: 6 }
      const { container } = render(<Row {...props} />)
      expect(screen.queryByTestId('row-container')).not.toBeInTheDocument()
      expect(container.firstChild).toBeEmptyDOMElement()
    })
  
    test('calls onCauseAndStatusChanges when a cause is changed', () => {
      render(<Row {...defaultProps} />)
      const textareas = screen.getAllByTestId('cell-textarea')
      
      fireEvent.change(textareas[1], { target: { value: 'Updated Cause' } })
      
      expect(defaultProps.onCauseAndStatusChanges).toHaveBeenCalledWith(
        1, 'Updated Cause', CauseStatus.Unchecked
      )
    })
  
    test('cells are disabled according to disabledCells prop', () => {
      const props = {
        ...defaultProps,
        disabledCells: [true, false, true]
      }
      render(<Row {...props} />)
      
      const textareas = screen.getAllByTestId('cell-textarea')
      expect(textareas[0]).toBeDisabled()
      expect(textareas[1]).not.toBeDisabled()
      expect(textareas[2]).toBeDisabled()
    })
  
    test('handles case when causes array is shorter than cols', () => {
      const props = {
        ...defaultProps,
        cols: 5,
        causes: ['Cause 1', 'Cause 2'],  // Only 2 causes for 5 columns
        causeStatuses: [CauseStatus.Unchecked, CauseStatus.Unchecked],
        disabledCells: [false, false, false, false, false],
        feedbacks: ['Feedback 1', 'Feedback 2', '', '', '']
      }
      
      render(<Row {...props} />)
      
      // The component should handle this by rendering empty causes for the missing positions
      const cells = screen.getAllByTestId('cell')
      expect(cells).toHaveLength(5)
      
      // Check that the first two cells have the expected causes
      expect(within(cells[0]).getByTestId('cell-textarea')).toHaveValue('Cause 1')
      expect(within(cells[1]).getByTestId('cell-textarea')).toHaveValue('Cause 2')
      
      // The rest should be empty
      expect(within(cells[2]).getByTestId('cell-textarea')).toHaveValue('')
      expect(within(cells[3]).getByTestId('cell-textarea')).toHaveValue('')
      expect(within(cells[4]).getByTestId('cell-textarea')).toHaveValue('')
    })
  
    test('handles case when causeStatuses array is shorter than cols', () => {
      const props = {
        ...defaultProps,
        cols: 5,
        causes: ['Cause 1', 'Cause 2', 'Cause 3', 'Cause 4', 'Cause 5'],
        causeStatuses: [CauseStatus.CorrectRoot, CauseStatus.CorrectNotRoot], // Only 2 statuses for 5 columns
        disabledCells: [false, false, false, false, false],
        feedbacks: ['Feedback 1', 'Feedback 2', 'Feedback 3', 'Feedback 4', 'Feedback 5']
      }
      
      render(<Row {...props} />)
      
      // Mock verification directly
      expect(mockCellComponent).toHaveBeenNthCalledWith(1, expect.objectContaining({
        causeStatus: CauseStatus.CorrectRoot
      }), {})
      
      expect(mockCellComponent).toHaveBeenNthCalledWith(2, expect.objectContaining({
        causeStatus: CauseStatus.CorrectNotRoot
      }), {})
      
      // Remaining cells should have Unchecked status
      expect(mockCellComponent).toHaveBeenNthCalledWith(3, expect.objectContaining({
        causeStatus: CauseStatus.Unchecked
      }), {})
    })
  
    test('updates local state when props change', () => {
      const { rerender } = render(<Row {...defaultProps} />)
      
      // Update props
      const updatedProps = {
        ...defaultProps,
        causes: ['Updated 1', 'Updated 2', 'Updated 3'],
        causeStatuses: [CauseStatus.CorrectRoot, CauseStatus.CorrectNotRoot, CauseStatus.Incorrect]
      }
      
      rerender(<Row {...updatedProps} />)
      
      // Verify that Cell components were called with updated props
      const calls = mockCellComponent.mock.calls
      const lastThreeCalls = calls.slice(-3)
      
      expect(lastThreeCalls[0][0].cause).toBe('Updated 1')
      expect(lastThreeCalls[0][0].causeStatus).toBe(CauseStatus.CorrectRoot)
      
      expect(lastThreeCalls[1][0].cause).toBe('Updated 2')
      expect(lastThreeCalls[1][0].causeStatus).toBe(CauseStatus.CorrectNotRoot)
      
      expect(lastThreeCalls[2][0].cause).toBe('Updated 3')
      expect(lastThreeCalls[2][0].causeStatus).toBe(CauseStatus.Incorrect)
    })
  
    // Test shouldShowCell logic
    describe('shouldShowCell logic', () => {
      test('always shows first three columns (A, B, C) in row 1', () => {
        render(<Row {...defaultProps} rowNumber={1} />)
        const cells = screen.getAllByTestId('cell')
        expect(cells).toHaveLength(3)
        expect(within(cells[0]).getByText('A1')).toBeInTheDocument()
        expect(within(cells[1]).getByText('B1')).toBeInTheDocument()
        expect(within(cells[2]).getByText('C1')).toBeInTheDocument()
      })
  
      test('shows cells with non-empty causes', () => {
        const props = {
          ...defaultProps,
          rowNumber: 3,
          causes: ['', 'Non-empty cause', ''],
          currentWorkingColumn: 0,
          activeColumns: [1]
        }
        render(<Row {...props} />)
        
        const cells = screen.getAllByTestId('cell')
        expect(cells).toHaveLength(1)
        expect(within(cells[0]).getByText('B3')).toBeInTheDocument()
      })
  
      test('shows cells with non-empty feedback', () => {
        const props = {
          ...defaultProps,
          rowNumber: 3,
          causes: ['', '', ''],
          feedbacks: ['', 'Non-empty feedback', ''],
          currentWorkingColumn: 0,
          activeColumns: [0]
        }
        render(<Row {...props} />)
        
        const cells = screen.getAllByTestId('cell')
        expect(cells).toHaveLength(1)
        expect(within(cells[0]).getByText('B3')).toBeInTheDocument()
      })
  
      test('shows current working column if in active columns for row 2', () => {
        const props = {
          ...defaultProps,
          rowNumber: 2,
          causes: ['', '', ''],
          feedbacks: ['', '', ''],
          currentWorkingColumn: 1,
          activeColumns: [1]
        }
        render(<Row {...props} />)
        
        const cells = screen.getAllByTestId('cell')
        expect(cells).toHaveLength(1)
        expect(within(cells[0]).getByText('B2')).toBeInTheDocument()
      })
  
      test('shows current working column if in active columns and not disabled for rows > 2', () => {
        const props = {
          ...defaultProps,
          rowNumber: 3,
          causes: ['', '', ''],
          feedbacks: ['', '', ''],
          currentWorkingColumn: 1,
          activeColumns: [1],
          disabledCells: [true, false, true]
        }
        render(<Row {...props} />)
        
        const cells = screen.getAllByTestId('cell')
        expect(cells).toHaveLength(1)
        expect(within(cells[0]).getByText('B3')).toBeInTheDocument()
      })
  
      test('does not show current working column if disabled for rows > 2', () => {
        const props = {
          ...defaultProps,
          rowNumber: 3,
          causes: ['', '', ''],
          feedbacks: ['', '', ''],
          currentWorkingColumn: 1,
          activeColumns: [1],
          disabledCells: [true, true, true] // All cells disabled
        }
        
        render(<Row {...props} />)
        const cells = screen.queryAllByTestId('cell')
        expect(cells).toHaveLength(0) // No visible cells
        
        // Check for empty/invisible cells
        const emptyCells = screen.getAllByTestId('empty-cell')
        expect(emptyCells).toHaveLength(3)
      })
  
      test('hides cells that do not meet visibility criteria with empty-cell elements', () => {
        const props = {
          ...defaultProps,
          rowNumber: 5,
          causes: ['', '', ''],
          feedbacks: ['', '', ''],
          currentWorkingColumn: 0,
          activeColumns: [1, 2] // currentWorkingColumn not in activeColumns
        }
        
        render(<Row {...props} />)
        
        // All cells should be empty/invisible
        const emptyCells = screen.getAllByTestId('empty-cell')
        expect(emptyCells).toHaveLength(3)
        expect(emptyCells[0]).toHaveClass('invisible')
      })
    })
  
    test('handles empty feedback array gracefully', () => {
      const props = {
        ...defaultProps,
        feedbacks: []
      }
      
      render(<Row {...props} />)
      
      // Component should not crash and should render cells with empty feedback
      const cells = screen.getAllByTestId('cell')
      expect(cells).toHaveLength(3)
      
      // All feedback elements should be empty
      const feedbackElements = screen.getAllByTestId('feedback')
      feedbackElements.forEach(el => {
        expect(el.textContent).toBe('')
      })
    })
  
    test('uses proper placeholder for non-disabled cells', () => {
      render(<Row {...defaultProps} />)
      
      // The placeholder should be set for non-disabled cells
      expect(mockCellComponent).toHaveBeenCalledWith(
        expect.objectContaining({
          placeholder: 'Isi sebab..',
          disabled: false
        }),
        {}
      )
    })
  
    test('uses empty placeholder for disabled cells', () => {
      const props = {
        ...defaultProps,
        disabledCells: [true, true, true]
      }
      
      render(<Row {...props} />)
      
      // The placeholder should be empty for disabled cells
      expect(mockCellComponent).toHaveBeenCalledWith(
        expect.objectContaining({
          placeholder: '',
          disabled: true
        }),
        {}
      )
    })
  }
)