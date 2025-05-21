import {fetchQuestions} from '@/actions/fetchQuestion'
import axiosInstance from '@/services/axiosInstance'
import AxiosMockAdapter from 'axios-mock-adapter'
import { formatTimestamp } from '@/utils/dateFormatter'
import { getSession } from 'next-auth/react'

jest.mock('@/utils/dateFormatter', () => ({
  formatTimestamp: jest.fn((ts) => `formatted-${ts}`)
}))

jest.mock('next-auth/react', () => ({
    getSession: jest.fn()
}))

describe('fetchQuestions', () => {
  const mock = new AxiosMockAdapter(axiosInstance)

  beforeEach(() => {
    (getSession as jest.Mock).mockResolvedValue({
    accessToken: 'mocked-access-token'
    })
})

  afterEach(() => {
    mock.reset()
    jest.clearAllMocks()
  })

  it('should fetch questions and return processed data', async () => {
    const mockApiResponse = {
      count: 2,
      previous: null,
      next: null,
      results: [
        {
          id: 1,
          question: 'Apa itu React?',
          title: 'Judul React',
          created_at: '2024-01-01T10:00:00Z',
          mode: 'quiz',
          username: 'user1',
          tags: ['react', 'frontend']
        },
        {
          id: 2,
          question: 'Apa itu Next.js?',
          title: 'Judul Next.js',
          created_at: '2024-01-02T12:00:00Z',
          mode: 'practice',
          username: 'user2',
          tags: ['nextjs', 'ssr']
        }
      ]
    }

    const time_range = 'last_week'
    const additional_param = '?param1=value1'

    const expectedUrl = `/question/history/${additional_param}&time_range=${time_range}`

    mock.onGet(expectedUrl).reply(200, mockApiResponse)

    const result = await fetchQuestions(time_range, additional_param)

    expect(result).toEqual({
      count: 2,
      processedData: [
        {
          id: 1,
          title: 'Apa itu React?',
          displayed_title: 'Judul React',
          timestamp: 'formatted-2024-01-01T10:00:00Z',
          mode: 'quiz',
          user: 'user1',
          tags: ['react', 'frontend']
        },
        {
          id: 2,
          title: 'Apa itu Next.js?',
          displayed_title: 'Judul Next.js',
          timestamp: 'formatted-2024-01-02T12:00:00Z',
          mode: 'practice',
          user: 'user2',
          tags: ['nextjs', 'ssr']
        }
      ]
    })

    expect(formatTimestamp).toHaveBeenCalledTimes(2)
  })

  it('should throw error if network fails', async () => {
    mock.onGet(/\/question\/history\//).networkError()

    await expect(fetchQuestions('last_week', '?param1=value1')).rejects.toThrow()
  })
})
