import MockAdapter from 'axios-mock-adapter'
import axiosInstance from '../../services/axiosInstance'
import { waitFor } from '@testing-library/react'
import axios from 'axios'
import toast from 'react-hot-toast'

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

jest.mock('react-hot-toast', () => ({
    error: jest.fn(),
    success: jest.fn(),
    dismiss: jest.fn(),
    loading: jest.fn()
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

beforeEach(() => {
  localStorageMock.clear()
})

afterEach(() => {
  jest.restoreAllMocks()
})

test('should handle successful request', async () => {
  const responseData = { message: 'Success' }

  localStorageMock.setItem('accessToken', 'token')

  mock.onGet('/question/submit').reply(200, responseData)

  const response = await axiosInstance.get('/question/submit')

  expect(response.status).toBe(200)
  expect(response.data).toEqual(responseData)
})

test('should handle failed request', async () => {
  mock.onGet('/question/submit').reply(500, { error: 'Internal Server Error' })

  try {
    await axiosInstance.get('/question/submit')
  } catch (error: any) {
    expect(error.response.status).toBe(500)
    expect(error.response.data).toEqual({ error: 'Internal Server Error' })
  }
})

test('should handle failed request when response 401', async () => {
  mock.onGet('/question/submit').reply(401, { error: 'Unauthorized' })
  localStorageMock.setItem('refreshToken', 'mock')

  try {
    await axiosInstance.get('/question/submit')
  } catch (error: any) {
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login-google/')
    })
  }
})

test('should handle reload the page if provided a refresh token', async () => {
  mock.onGet('/question/submit').reply(401, { error: 'Unauthorized' })
  localStorageMock.setItem('refreshToken', 'mock')

  const mockResponse = { access: 'mock_new_access_token' }
  mockAxios.onPost(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/token/refresh/`).reply(200, mockResponse)

  try {
    await axiosInstance.get('/question/submit')
  } catch (error: any) {
    await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/token/refresh/`, { token: 'mock' })

    await waitFor(() => {
      expect(mockReload).toHaveBeenCalled()
    })
  }
})

test('should handle errors in request configuration', async () => {
  const responseData = { message: 'Success' }
  mock.onGet('/question/submit').reply(200, responseData)
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
    await axiosInstance.get('/question/submit')
  } catch (error: any) {
    expect(error).toBe(testError)
  }
})

test('should update accessToken, show toast, and reload on token refresh', async () => {
  mock.onGet('/question/submit').reply(401, { error: 'Unauthorized' })
  localStorageMock.setItem('refreshToken', 'mock_refresh_token')

  const mockResponse = { access: 'mock_new_access_token' }
  mockAxios.onPost(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/token/refresh/`).reply(200, mockResponse)

  const toastMock = jest.spyOn(toast, "error")

  try {
    await axiosInstance.get('/question/submit')
  } catch (error: any) {
    await waitFor(() => {
      expect(localStorageMock.getItem('accessToken')).toBe('mock_new_access_token')

      expect(toastMock).toHaveBeenCalledWith('Sesi anda telah diperbaharui. Silakan coba lagi')

      expect(mockReload).toHaveBeenCalled()
    })
  }
})

test('should update accessToken, show toast, and reload on successful token refresh', async () => {
  mock.onGet('/protected-route').replyOnce(401, { error: 'Unauthorized' });
  
  const newAccessToken = 'new-access-token';
  mockAxios.onPost(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/token/refresh/`)
    .reply(200, { access: newAccessToken });
  
  mock.onGet('/protected-route').replyOnce(200, { success: true });

  localStorageMock.setItem('refreshToken', 'valid-refresh-token');
  localStorageMock.setItem('accessToken', 'expired-access-token');

  const setItemSpy = jest.spyOn(localStorageMock, 'setItem');

  try {
    await axiosInstance.get('/protected-route');
  } catch (error: any) {
    await waitFor(() => {
      expect(setItemSpy).toHaveBeenCalledWith('accessToken', newAccessToken);
      
      expect(toast.error).toHaveBeenCalledWith('Sesi anda telah diperbaharui. Silakan coba lagi');
      
      expect(mockReload).toHaveBeenCalled();
    });
  }
});