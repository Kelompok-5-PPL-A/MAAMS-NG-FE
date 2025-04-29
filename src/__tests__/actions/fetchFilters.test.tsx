import axiosInstance from '@/services/axiosInstance'
import AxiosMockAdapter from 'axios-mock-adapter'
import fetchFilters from '@/actions/fetchFilters'
import { FilterData } from '@/components/types/filterData'
import { getSession } from 'next-auth/react'

jest.mock('next-auth/react', () => ({
  getSession: jest.fn()
}))

describe('fetchFilters', () => {
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

  it('should fetch and return filter data correctly', async () => {
    const mockResponse = {
      pengguna: ['user1', 'user2'],
      judul: ['Judul A', 'Judul B'],
      topik: ['Topik X', 'Topik Y']
    }

    mock.onGet('/question/history/field-values/').reply((config) => {
      return [200, mockResponse]
    })

    const result = await fetchFilters()

    const expected: FilterData = {
      pengguna: ['user1', 'user2'],
      judul: ['Judul A', 'Judul B'],
      topik: ['Topik X', 'Topik Y']
    }

    expect(result).toEqual(expected)
  })

  it('should throw error on network failure', async () => {
    mock.onGet('/question/history/field-values/').networkError()

    await expect(fetchFilters()).rejects.toThrow()
  })
})
