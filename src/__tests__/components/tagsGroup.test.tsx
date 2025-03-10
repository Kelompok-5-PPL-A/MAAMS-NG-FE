import React from 'react'
import { render, screen } from '@testing-library/react'
import { TagsGroup } from '../../components/tagsGroup'
import { Badge } from '../../badges'

describe('TagsGroup', () => {
  it('displays each tag correctly', () => {
    const tags = ['React', 'Node']
    render(<TagsGroup tags={tags} />)
    tags.forEach(tag => expect(screen.getByText(tag)).toBeInTheDocument())
  })

  it('renders correctly with an empty tags array', () => {
    render(<TagsGroup tags={[]} />)
    expect(screen.queryByText(/./)).not.toBeInTheDocument()
  })

  it('renders correctly with duplicate tags', () => {
    const tags = ['React', 'React', 'Node']
    render(<TagsGroup tags={tags} />)
    expect(screen.getAllByText('React').length).toBe(2)
    expect(screen.getByText('Node')).toBeInTheDocument()
  })

  it('renders tags with special characters', () => {
    const tags = ['C++', 'C#', 'JavaScript!']
    render(<TagsGroup tags={tags} />)
    tags.forEach(tag => expect(screen.getByText(tag)).toBeInTheDocument())
  })

  it('renders long tag names correctly', () => {
    const tags = ['ThisIsAVeryLongTagNameToTestRendering']
    render(<TagsGroup tags={tags} />)
    expect(screen.getByText(tags[0])).toBeInTheDocument()
  })

  it('handles undefined tags gracefully', () => {
    // @ts-expect-error Testing an undefined value
    render(<TagsGroup tags={undefined} />)
    expect(screen.queryByText(/./)).not.toBeInTheDocument()
  })

  it('ensures each tag is wrapped inside a Badge component', () => {
    const tags = ['React', 'Node']
    const { container } = render(<TagsGroup tags={tags} />)

    // Count the number of Badge elements (divs that contain tag texts)
    const badgeElements = container.querySelectorAll('div.flex.items-center.bg-yellow-400.rounded-full.px-3.py-1')
    expect(badgeElements.length).toBe(tags.length)
  })
})
