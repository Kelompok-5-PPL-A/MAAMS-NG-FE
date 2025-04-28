import '@testing-library/jest-dom'
import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import { Row } from '../../components/row'
import { CauseStatus } from '../../lib/enum'

describe('Row Component', () => {
  const rowNumber = 1
  const cols = 3
  const causes = ['', '', '']
  const causeStatuses = [CauseStatus.Unchecked, CauseStatus.Unchecked, CauseStatus.Unchecked]
  const disabledCells = [false, false, false]
  const feedbacks = ['Feedback 1', 'Feedback 2', 'Feedback 3']
  const mockOnCauseAndStatusChanges = jest.fn()

  test('renders correctly with the given number of columns, causes, and statuses', () => {
    const { getByTestId, getAllByTestId } = render(
      <Row
        rowNumber={rowNumber}
        cols={cols}
        causes={causes}
        causeStatuses={causeStatuses}
        disabledCells={disabledCells}
        onCauseAndStatusChanges={mockOnCauseAndStatusChanges}
        feedbacks={feedbacks} causesId={[]}      />
    )

    expect(getByTestId('row-container')).toHaveClass(`grid grid-cols-${cols}`)
    const cellElements = getAllByTestId('cell')
    expect(cellElements).toHaveLength(cols)
  })

  test('renders with disabled cells based on disabledCells prop', () => {
    const disabledCellsTest = [true, false, true]
    const { getAllByTestId } = render(
      <Row
        rowNumber={rowNumber}
        cols={cols}
        causes={causes}
        causeStatuses={causeStatuses}
        disabledCells={disabledCellsTest}
        onCauseAndStatusChanges={mockOnCauseAndStatusChanges}
        feedbacks={feedbacks} causesId={[]}      />
    )

    const cellElements = getAllByTestId('cell')
    expect(cellElements[0].querySelector('textarea')).toBeDisabled()
    expect(cellElements[1].querySelector('textarea')).not.toBeDisabled()
    expect(cellElements[2].querySelector('textarea')).toBeDisabled()
  })

  test('does not render with an invalid number of columns', () => {
    const invalidCols = 6

    const { queryByTestId } = render(
      <Row
        rowNumber={rowNumber}
        cols={invalidCols}
        causes={Array(invalidCols).fill('')}
        causeStatuses={Array(invalidCols).fill(CauseStatus.Unchecked)}
        disabledCells={Array(invalidCols).fill(false)}
        onCauseAndStatusChanges={mockOnCauseAndStatusChanges}
        feedbacks={Array(invalidCols).fill('')} causesId={[]}      />
    )

    expect(queryByTestId('row-container')).toBeNull()
  })

  test('correctly updates causes and statuses', () => {
    const initialCauses = ['Cause 1', 'Cause 2', 'Cause 3']
    const initialStatuses = [CauseStatus.CorrectNotRoot, CauseStatus.Incorrect, CauseStatus.Unchecked]

    const { getAllByTestId } = render(
      <Row
        rowNumber={rowNumber}
        cols={cols}
        causes={initialCauses}
        causeStatuses={initialStatuses}
        disabledCells={disabledCells}
        onCauseAndStatusChanges={mockOnCauseAndStatusChanges}
        feedbacks={feedbacks} causesId={[]}      />
    )

    const cellElements = getAllByTestId('cell')
    cellElements.forEach((cell, index) => {
      const textarea = cell.querySelector('textarea')
      expect(textarea).toHaveValue(initialCauses[index])
    })
  })

  test('matches snapshot', () => {
    const { asFragment } = render(
      <Row
        rowNumber={rowNumber}
        cols={cols}
        causes={causes}
        causeStatuses={causeStatuses}
        disabledCells={disabledCells}
        onCauseAndStatusChanges={mockOnCauseAndStatusChanges}
        feedbacks={feedbacks} causesId={[]}      />
    )

    expect(asFragment()).toMatchSnapshot()
  })

  test('renders feedback text correctly', () => {
    const { getAllByTestId } = render(
      <Row
        rowNumber={rowNumber}
        cols={cols}
        causes={causes}
        causeStatuses={causeStatuses}
        disabledCells={disabledCells}
        onCauseAndStatusChanges={mockOnCauseAndStatusChanges}
        feedbacks={feedbacks}
        causesId={[]}      
      />
    )
  
    const feedbackElements = getAllByTestId('cell')
    feedbackElements.forEach((cell, index) => {
      expect(cell).toHaveTextContent(feedbacks[index])
    })
  })
  
  test('does not render feedback when empty', () => {
    const emptyFeedbacks = ['', '', '']
    
    const { queryAllByTestId } = render(
      <Row
        rowNumber={rowNumber}
        cols={cols}
        causes={causes}
        causeStatuses={causeStatuses}
        disabledCells={disabledCells}
        onCauseAndStatusChanges={mockOnCauseAndStatusChanges}
        feedbacks={emptyFeedbacks}
        causesId={[]}      
      />
    )
  
    const feedbackElements = queryAllByTestId('cell')
    feedbackElements.forEach((cell) => {
      expect(cell).not.toHaveTextContent('Feedback')
    })
  })
  
  test('calls onCauseAndStatusChanges when a cause is updated', () => {
    const { getAllByTestId } = render(
      <Row
        rowNumber={rowNumber}
        cols={cols}
        causes={causes}
        causeStatuses={causeStatuses}
        disabledCells={disabledCells}
        onCauseAndStatusChanges={mockOnCauseAndStatusChanges}
        feedbacks={feedbacks}
        causesId={[]}      
      />
    )
  
    const textareas = getAllByTestId('cell').map(cell => cell.querySelector('textarea'))
  
    fireEvent.change(textareas[1]!, { target: { value: 'Updated Cause' } })
  
    expect(mockOnCauseAndStatusChanges).toHaveBeenCalledWith(1, 'Updated Cause', CauseStatus.Unchecked)
  })
  
})