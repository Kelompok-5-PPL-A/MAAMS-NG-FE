import { render, screen, fireEvent } from '@testing-library/react'
import Dialog from '@/components/common/Dialog'
import React from 'react'
import '@testing-library/jest-dom'

describe('Dialog Component', () => {
  const onClose = jest.fn()
  const testTitle = 'Test Dialog'
  const testContent = 'Test Content'

  beforeEach(() => {
    onClose.mockClear()
    document.body.style.overflow = ''
    jest.restoreAllMocks()
  })

  test('renders dialog when isOpen is true', () => {
    render(
      <Dialog isOpen={true} onClose={onClose} title={testTitle}>
        {testContent}
      </Dialog>
    )
    expect(screen.getByText(testContent)).toBeInTheDocument()
  })

  test('does not render dialog when isOpen is false', () => {
    render(
      <Dialog isOpen={false} onClose={onClose} title={testTitle}>
        {testContent}
      </Dialog>
    )
    expect(screen.queryByText(testContent)).not.toBeInTheDocument()
  })

  test('calls onClose when backdrop is clicked', () => {
    render(
      <Dialog isOpen={true} onClose={onClose} title={testTitle}>
        {testContent}
      </Dialog>
    )
    fireEvent.click(screen.getByLabelText('Close dialog'))
    expect(onClose).toHaveBeenCalled()
  })

  test('calls onClose when Escape key is pressed', () => {
    render(
      <Dialog isOpen={true} onClose={onClose} title={testTitle}>
        {testContent}
      </Dialog>
    )
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalled()
  })

  test('does not call onClose when other keys are pressed', () => {
    render(
      <Dialog isOpen={true} onClose={onClose} title={testTitle}>
        {testContent}
      </Dialog>
    )
    fireEvent.keyDown(document, { key: 'Enter' })
    expect(onClose).not.toHaveBeenCalled()
  })

  test('sets aria-labelledby when title is provided', () => {
    render(
      <Dialog isOpen={true} onClose={onClose} title={testTitle}>
        {testContent}
      </Dialog>
    )
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-labelledby')
  })

  test('does not set aria-labelledby when title is not provided', () => {
    render(
      <Dialog isOpen={true} onClose={onClose}>
        {testContent}
      </Dialog>
    )
    const dialog = screen.getByRole('dialog')
    expect(dialog).not.toHaveAttribute('aria-labelledby')
  })

  test('prevents body scrolling when dialog is open', () => {
    render(
      <Dialog isOpen={true} onClose={onClose} title={testTitle}>
        {testContent}
      </Dialog>
    )
    expect(document.body.style.overflow).toBe('hidden')
  })

  test('restores body scrolling when dialog is closed', () => {
    const { rerender } = render(
      <Dialog isOpen={true} onClose={onClose} title={testTitle}>
        {testContent}
      </Dialog>
    )
    expect(document.body.style.overflow).toBe('hidden')

    rerender(
      <Dialog isOpen={false} onClose={onClose} title={testTitle}>
        {testContent}
      </Dialog>
    )
    expect(document.body.style.overflow).toBe('unset')
  })

  test('removes event listeners when unmounted', () => {
    const { unmount } = render(
      <Dialog isOpen={true} onClose={onClose} title={testTitle}>
        {testContent}
      </Dialog>
    )
    unmount()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).not.toHaveBeenCalled()
  })

  test('content click does not trigger onClose', () => {
    render(
      <Dialog isOpen={true} onClose={onClose} title={testTitle}>
        <div data-testid="dialog-content">{testContent}</div>
      </Dialog>
    )
    fireEvent.click(screen.getByTestId('dialog-content'))
    expect(onClose).not.toHaveBeenCalled()
  })
})