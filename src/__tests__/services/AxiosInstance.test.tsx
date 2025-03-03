import MockAdapter from 'axios-mock-adapter'
import axiosInstance from '../../services/axiosInstance'
import { waitFor } from '@testing-library/react'
import axios from 'axios'

const mock = new MockAdapter(axiosInstance)
const mockAxios = new MockAdapter(axios)

const mockPush = jest.fn()
const mockReload = jest.fn()
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: mockPush,
    reload: mockReload
  })
}))

const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    }
  }
})()

Object.defineProperty(window, 'localStorage', { value: localStorageMock })

test('should handle successful request', async () => {
  const responseData = { message: 'Success' }

  localStorageMock.setItem('access', 'token')

  mock.onGet('/api/data').reply(200, responseData)

  const response = await axiosInstance.get('/api/data')

  expect(response.status).toBe(200)
  expect(response.data).toEqual(responseData)
})

test('should handle failed request', async () => {
  mock.onGet('/api/data').reply(500, { error: 'Internal Server Error' })

  try {
    await axiosInstance.get('/api/data')
  } catch (error: any) {
    expect(error.response.status).toBe(500)
    expect(error.response.data).toEqual({ error: 'Internal Server Error' })
  }
})

test('should handle failed request when response 401', async () => {
  mock.onGet('/api/data').reply(401, { error: 'Unauthorized' })
  localStorageMock.setItem('refresh', 'mock')

  try {
    await axiosInstance.get('/api/data')
  } catch (error: any) {
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login')
    })
  }
})

test('should handle reload the page if provided a refresh token', async () => {
  mock.onGet('/api/data').reply(401, { error: 'Unauthorized' })
  localStorageMock.setItem('refresh', 'mock')

  const mockResponse = { access: 'mock_new_access_token' }
  mockAxios.onPost(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/token/refresh/`).reply(200, mockResponse)

  try {
    await axiosInstance.get('/api/data')
  } catch (error: any) {
    await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/token/refresh/`, { token: 'mock' })

    await waitFor(() => {
      expect(mockReload).toHaveBeenCalled()
    })
  }
})

test('should handle errors in request configuration', async () => {
  const responseData = { message: 'Success' }
  mock.onGet('/api/data').reply(200, responseData)
  const testError = new Error('Failed to get item from localStorage')

  jest.spyOn(localStorage, 'getItem').mockImplementation(() => {
    throw testError
  })

  axiosInstance.interceptors.request.use(
    (config) => {
      localStorage.getItem('access_token')
      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )

  try {
    await axiosInstance.get('/api/data')
  } catch (error: any) {
    expect(error).toBe(testError)
  }
})