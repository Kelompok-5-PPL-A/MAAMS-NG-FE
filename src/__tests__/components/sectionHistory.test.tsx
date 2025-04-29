import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import Section from '../../components/sectionHistory'
import { SectionHistoryProps } from '../../components/types/sectionHistory'
import '@testing-library/jest-dom'
import router from 'next/router' // Menggunakan useRouter daripada 'next/router'

// Mocking useRouter
jest.mock('next/router', () => ({
  push: jest.fn()
}))

describe('Section Component', () => {
  const title = 'Test Section'
  const seeMoreLink = '/test'
  const keyword = 'test'

  it('renders see more link correctly', () => {
    const { getByText } = render(<Section title={title} items={[]} seeMoreLink={seeMoreLink} keyword={keyword} />)
    const seeMoreElement = getByText('See More')
    expect(seeMoreElement).toBeInTheDocument()

    fireEvent.click(seeMoreElement)
    expect(router.push).toHaveBeenCalledWith({
      pathname: seeMoreLink,
      query: { keyword: encodeURIComponent(keyword) }
    })
  })

  it('does not render see more link if seeMoreLink is not provided', () => {
    const { queryByText } = render(<Section title={title} items={[]} keyword={keyword} />)
    const seeMoreElement = queryByText('See More')
    expect(seeMoreElement).toBeNull()
  })
  it('renders section with items correctly', () => {
    const items = [
      {
        id: 1,
        displayed_title: 'Item 1',
        title: 'Item 1',
        timestamp: '2024-03-25',
        mode: 'read',
        user: 'User 1',
        tags: ['tag1']
      }
    ]
    const { getByText } = render(<Section title='History' items={items} keyword='' seeMoreLink='/some-link' />)
    expect(getByText('Item 1')).toBeInTheDocument()
  })

  it('renders section with no items when items array is empty', () => {
    const items: SectionHistoryProps['items'] = [] // empty array

    const { getByTestId, queryByText } = render(
      <Section title='History' items={items} keyword='' seeMoreLink='/some-link' />
    )
    expect(getByTestId('History-section')).toBeInTheDocument()
    expect(queryByText('Item 1')).toBeNull()
    expect(queryByText('Item 2')).toBeNull()
  })

  it('renders ListItem component with correct props', () => {
    const items = [
      {
        id: 1,
        displayed_title: 'Item 1',
        title: 'Item 1',
        timestamp: '2024-03-25',
        mode: 'read',
        user: 'User 1',
        tags: ['tag1']
      }
    ]
    const { getByText } = render(<Section title='History' items={items} keyword='' />)
    expect(getByText('Item 1')).toBeInTheDocument()
  })
})
