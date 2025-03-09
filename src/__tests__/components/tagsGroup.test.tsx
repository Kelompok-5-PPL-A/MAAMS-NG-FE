import React from 'react'
import { render, screen } from '@testing-library/react'
import { TagsGroup } from '../../components/tagsGroup'

describe('TagsGroup', () => {
  it('displays each tag correctly', () => {
    const tags = ['React', 'Node']
    render(<TagsGroup tags={tags} />)
    expect(screen.getByText('React')).toBeInTheDocument()
    expect(screen.getByText('Node')).toBeInTheDocument()
  })

  it('renders correctly with an empty tags array', () => {
    render(<TagsGroup tags={[]} />)
    expect(screen.queryByText(/./)).not.toBeInTheDocument()
  })

  it('renders correctly with duplicate tags', () => {
    const tags = ['React', 'React', 'Node']
    render(<TagsGroup tags={tags} />)
    const reactTags = screen.getAllByText('React')
    expect(reactTags.length).toBe(2)
    expect(screen.getByText('Node')).toBeInTheDocument()
  })

  it('renders tags with special characters', () => {
    const tags = ['C++', 'C#', 'JavaScript!']
    render(<TagsGroup tags={tags} />)
    expect(screen.getByText('C++')).toBeInTheDocument()
    expect(screen.getByText('C#')).toBeInTheDocument()
    expect(screen.getByText('JavaScript!')).toBeInTheDocument()
  })

  it('renders long tag names correctly', () => {
    const tags = ['ThisIsAVeryLongTagNameToTestRendering']
    render(<TagsGroup tags={tags} />)
    expect(screen.getByText('ThisIsAVeryLongTagNameToTestRendering')).toBeInTheDocument()
  })
})
