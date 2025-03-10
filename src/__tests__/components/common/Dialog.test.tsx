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

  test('calls showModal when available', () => {
    const mockShowModal = jest.fn()
    HTMLDialogElement.prototype.showModal = mockShowModal

    render(<Dialog isOpen={true} onClose={onClose} title={testTitle}>{testContent}</Dialog>)
    expect(mockShowModal).toHaveBeenCalled()
  })

  test('renders children when isOpen is true', () => {
    const { getByText } = render(
      <Dialog isOpen={true} onClose={() => {}} title="Test Dialog">
        <p>Dialog Content</p>
      </Dialog>
    );
    expect(getByText('Dialog Content')).toBeInTheDocument();
  });

  test('does not render when isOpen is false', () => {
    const { queryByText } = render(
      <Dialog isOpen={false} onClose={() => {}} title="Test Dialog">
        <p>Dialog Content</p>
      </Dialog>
    );
    expect(queryByText('Dialog Content')).not.toBeInTheDocument();
  });

  test('closes when escape key is pressed', () => {
    const handleClose = jest.fn();
    render(
      <Dialog isOpen={true} onClose={handleClose} title="Test Dialog">
        <p>Dialog Content</p>
      </Dialog>
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalled();
  });

  test('closes when background is clicked', () => {
    const handleClose = jest.fn();
    const { getByLabelText } = render(
      <Dialog isOpen={true} onClose={handleClose} title="Test Dialog">
        <p>Dialog Content</p>
      </Dialog>
    );
    fireEvent.click(getByLabelText('Close dialog'));
    expect(handleClose).toHaveBeenCalled();
  });
})
