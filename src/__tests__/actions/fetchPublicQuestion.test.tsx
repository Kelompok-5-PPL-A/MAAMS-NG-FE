import { fetchPublicQuestions } from '@/actions/fetchPublicQuestion'
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

describe('fetchPublicQuestions', () => {
  const mock = new AxiosMockAdapter(axiosInstance)

  const queryParams = 'privileged/?count=5&p=1'
  const expectedUrl = `/question/privileged/${queryParams}`

  beforeEach(() => {
      (getSession as jest.Mock).mockResolvedValue({
      accessToken: 'mocked-access-token'
      })
  })

  afterEach(() => {
    mock.reset()
    jest.clearAllMocks()
  })

  it('should fetch public questions and return processed data', async () => {
    const mockApiResponse = {
      count: 2,
      previous: null,
      next: null,
      results: [
        {
          id: 1,
          question: 'Apa itu JavaScript?',
          title: 'Belajar JavaScript',
          created_at: '2024-01-01T10:00:00Z',
          mode: 'quiz',
          username: 'user1',
          tags: ['javascript', 'frontend']
        },
        {
          id: 2,
          question: 'Apa itu TypeScript?',
          title: 'Belajar TypeScript',
          created_at: '2024-01-02T12:00:00Z',
          mode: 'practice',
          username: 'user2',
          tags: ['typescript', 'frontend']
        }
      ]
    }

    mock.onGet(expectedUrl).reply(200, mockApiResponse)

    const result = await fetchPublicQuestions(queryParams)

    expect(result).toEqual({
      count: 2,
      processedData: [
        {
          id: 1,
          title: 'Apa itu JavaScript?',
          displayed_title: 'Belajar JavaScript',
          timestamp: 'formatted-2024-01-01T10:00:00Z',
          mode: 'quiz',
          user: 'user1',
          tags: ['javascript', 'frontend']
        },
        {
          id: 2,
          title: 'Apa itu TypeScript?',
          displayed_title: 'Belajar TypeScript',
          timestamp: 'formatted-2024-01-02T12:00:00Z',
          mode: 'practice',
          user: 'user2',
          tags: ['typescript', 'frontend']
        }
      ]
    })

    expect(formatTimestamp).toHaveBeenCalledTimes(2)
  })

  it('should throw error if network fails', async () => {
    mock.onGet(expectedUrl).networkError()

    await expect(fetchPublicQuestions(queryParams)).rejects.toThrow()
  })
})
