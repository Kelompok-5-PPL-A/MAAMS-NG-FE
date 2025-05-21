import React from 'react'
import { render, screen, fireEvent, within } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Row } from '../../components/row'
import { CauseStatus } from '../../lib/enum'

jest.mock('../../components/cell', () => ({
  Cell: ({ cellName, cause, onChange, disabled, placeholder }: any) => (
    <div data-testid={`cell-${cellName}`}>
      <input
        data-testid={`cell-input-${cellName}`}
        value={cause}
        disabled={disabled}
        placeholder={disabled ? undefined : placeholder}
        onChange={(e) => !disabled && onChange(e.target.value)}
      />
    </div>
  )
}))

describe('Row Component', () => {
  const mockOnCauseAndStatusChanges = jest.fn()
  
  const defaultProps = {
    rowNumber: 1,
    cols: 4,
    causes: ['', '', '', ''],
    causeStatuses: [CauseStatus.Unchecked, CauseStatus.Unchecked, CauseStatus.Unchecked, CauseStatus.Unchecked],
    disabledCells: [false, false, false, false],
    currentWorkingColumn: 0,
    activeColumns: [0, 1, 2],
    onCauseAndStatusChanges: mockOnCauseAndStatusChanges,
    feedbacks: ['', '', '', '']
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders visible cells correctly (row 1, cols 3)', () => {
    render(<Row {...defaultProps} />)
  
    const expectedTestIds = ['cell-A1', 'cell-B1', 'cell-C1']
    expectedTestIds.forEach((testId) => {
      expect(screen.getByTestId(testId)).toBeInTheDocument()
    })
  })
  

  it('hides cells if not visible (row > 1)', () => {
    render(
      <Row
        {...defaultProps}
        rowNumber={3}
        causes={['', '', '']}
        feedbacks={['', '', '']}
        disabledCells={[true, true, true]}
        currentWorkingColumn={0}
      />
    )
    const emptyCells = screen.getAllByTestId('empty-cell')
    expect(emptyCells.length).toBe(3)
  })

  it('calls onCauseAndStatusChanges when text is entered', () => {
    render(<Row {...defaultProps} />)

    const input = screen.getByTestId('cell-input-A1')
    fireEvent.change(input, { target: { value: 'Updated Cause' } })

    expect(defaultProps.onCauseAndStatusChanges).toHaveBeenCalledWith(
      0,
      'Updated Cause',
      CauseStatus.Unchecked
    )
  })

  it('does not trigger onChange if disabled', () => {
    render(
      <Row
        {...defaultProps}
        disabledCells={[true, true, true]}
      />
    )

    const input = screen.getByTestId('cell-input-A1')
    fireEvent.change(input, { target: { value: 'Should not work' } })

    expect(defaultProps.onCauseAndStatusChanges).not.toHaveBeenCalled()
  })

  it('shows placeholder only if not disabled', () => {
    render(
      <Row
        {...defaultProps}
        causes={['', '', '']}
        disabledCells={[false, true, false]}
      />
    )

    const inputA = screen.getByTestId('cell-input-A1')
    const inputB = screen.getByTestId('cell-input-B1')
    const inputC = screen.getByTestId('cell-input-C1')

    expect(inputA).toHaveAttribute('placeholder', 'Isi sebab..')
    expect(inputB).not.toHaveAttribute('placeholder')
    expect(inputC).toHaveAttribute('placeholder', 'Isi sebab..')
  })

  it('uses default activeColumns and currentWorkingColumn (rowNumber 2)', () => {
    render(
      <Row
        {...defaultProps}
        rowNumber={2}
        causes={['', '', '']}
        feedbacks={['', '', '']}
        disabledCells={[true, true, true]}
        activeColumns={undefined as any}
        currentWorkingColumn={undefined as any}
      />
    )
  
    // Dengan rowNumber = 2, semua cell seharusnya tetap terlihat meskipun disabled
    const expectedTestIds = ['cell-A2', 'cell-B2', 'cell-C2']
    expectedTestIds.forEach((testId) => {
      expect(screen.getByTestId(testId)).toBeInTheDocument()
    })
  })
  

  it('shows column for row > 2 if currentWorkingColumn is active and not disabled', () => {
    render(
      <Row
        {...defaultProps}
        rowNumber={4}
        currentWorkingColumn={1}
        activeColumns={[1]}
        disabledCells={[true, false, true]}
        causes={['', '', '']}
        feedbacks={['', '', '']}
      />
    )

    const visibleCells = screen.getAllByTestId('cell-B4')
    expect(visibleCells.length).toBe(1)
    expect(screen.getByTestId('cell-B4')).toBeInTheDocument()
  })

  it('uses fallback values if index exceeds array lengths', () => {
    const cols = 5

    render(
      <Row
        {...defaultProps}
        rowNumber={2}
        cols={cols}
        causes={Array(cols).fill('')}
        causeStatuses={[]} // intentionally shorter
        feedbacks={Array(cols).fill('')}
        disabledCells={[true, false, true, true, true]}
        activeColumns={[1]}
        currentWorkingColumn={1}
      />
    )

    const visibleCells = screen.getAllByTestId('cell-B2')
    expect(visibleCells.length).toBe(1)

    const input = screen.getByTestId('cell-input-B2')
    expect(input).toHaveAttribute('placeholder', 'Isi sebab..')
  })

  it('should only render cells that are not disabled when rowNumber > 2', () => {
    const props = {
      ...defaultProps,
      rowNumber: 3,
      cols: 5,
      causes: ['', '', '', '', ''],
      causeStatuses: Array(5).fill(CauseStatus.Unchecked),
      disabledCells: [true, false, true, false, true],
      feedbacks: ['', '', '', '', ''],
      activeColumns: [0, 1, 2, 3, 4],
      currentWorkingColumn: 3
    }

    render(<Row {...props} />)

    const visibleCells = screen.getAllByTestId('cell-D3')
    const invisibleCells = screen.getAllByTestId('empty-cell')

    expect(visibleCells).toHaveLength(1)
    expect(invisibleCells).toHaveLength(4)
  })

  it('should render <Cell /> and call onChange handler correctly', () => {
    const props = {
      ...defaultProps,
      rowNumber: 3,
      cols: 3,
      causes: ['', '', ''],
      causeStatuses: [CauseStatus.Unchecked, CauseStatus.Unchecked, CauseStatus.Unchecked],
      disabledCells: [false, true, true],
      currentWorkingColumn: 0,
      activeColumns: [0, 1, 2]
    }

    render(<Row {...props} />)

    const input = screen.getByTestId('cell-input-A3')
    fireEvent.change(input, { target: { value: 'New Cause' } })

    expect(props.onCauseAndStatusChanges).toHaveBeenCalledWith(0, 'New Cause', CauseStatus.Unchecked)
  })

  it('does not show cell D1 visibly when rowNumber is 1 and index >= 3', () => {
    render(
      <Row
        {...defaultProps}
        rowNumber={1}
        cols={4}
        causes={['', '', '', '']}
        causeStatuses={[CauseStatus.Unchecked, CauseStatus.Unchecked, CauseStatus.Unchecked, CauseStatus.Unchecked]}
        disabledCells={[false, false, false, true]}
        currentWorkingColumn={0}
        activeColumns={[0, 1, 2]}
        feedbacks={['', '', '', '']}
      />
    )

    // Find all cells
    const cells = screen.getAllByTestId('cell')
    expect(cells).toHaveLength(4) // Should have 4 cells (A1, B1, C1, D1)

    // Find the cell D1 container
    const cellD1 = screen.getByTestId('cell-D1')
    expect(cellD1).toBeInTheDocument()

    // Find the input for D1
    const inputD1 = screen.getByTestId('cell-input-D1')
    expect(inputD1).toBeInTheDocument()
    expect(inputD1).toBeDisabled()
    expect(inputD1).not.toHaveAttribute('placeholder')
  })

  it('does not render placeholder if cell is disabled', () => {
    render(
      <Row
        {...defaultProps}
        rowNumber={3}
        cols={3}
        disabledCells={[true, true, true]}
      />
    )
  
    const input = screen.getByTestId('cell-input-A3')
    expect(input).toBeDisabled()
    expect(input).not.toHaveAttribute('placeholder')
  })

  it('uses empty placeholder if index >= disabledCells.length', () => {
    render(
      <Row
        {...defaultProps}
        rowNumber={3}
        cols={4}
        disabledCells={[false, false]} // intentionally shorter
      />
    )
  
    const input = screen.getByTestId('cell-input-C3')
    expect(input).toBeDisabled()
    expect(input).not.toHaveAttribute('placeholder')
  })

  it('renders empty feedback when index exceeds feedbacks array', () => {
    render(
      <Row
        {...defaultProps}
        rowNumber={2}
        cols={3}
        feedbacks={['Only one']} // deliberately short
      />
    )
  
    const input = screen.getByTestId('cell-input-B2')
    expect(input).toHaveValue('')
  })
  
})
