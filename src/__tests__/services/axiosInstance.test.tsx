import MockAdapter from 'axios-mock-adapter'
import axiosInstance, { setAuthTokens, clearAuthTokens } from '../../services/axiosInstance'
import { waitFor } from '@testing-library/react'
import axios from 'axios'
import toast from 'react-hot-toast'

// Mock setup
const mock = new MockAdapter(axiosInstance)
const mockAxios = new MockAdapter(axios)

jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    reload: jest.fn()
  })
}))

jest.mock('react-hot-toast', () => ({
  error: jest.fn(),
  success: jest.fn(),
  dismiss: jest.fn(),
  loading: jest.fn()
}))

// LocalStorage mock
const localStorageMock = (function () {
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

beforeAll(() => {
  Object.defineProperty(window, 'localStorage', { value: localStorageMock })
})

beforeEach(() => {
  localStorageMock.clear()
  jest.clearAllMocks()
  mock.reset()
  mockAxios.reset()
})

afterAll(() => {
  mock.restore()
  mockAxios.restore()
})

describe('axiosInstance', () => {
  describe('successful requests', () => {
    it('should handle successful request with access token', async () => {
      const responseData = { message: 'Success' }
      localStorageMock.setItem('accessToken', 'valid-token')
      setAuthTokens('valid-token', 'refresh-token')
      mock.onGet('/protected').reply(200, responseData)

      const response = await axiosInstance.get('/protected')

      expect(response.status).toBe(200)
      expect(response.data).toEqual(responseData)
    })
  })

  describe('failed requests', () => {
    it('should handle server errors', async () => {
      mock.onGet('/error').reply(500, { error: 'Internal Server Error' })

      await expect(axiosInstance.get('/error')).rejects.toMatchObject({
        response: {
          status: 500,
          data: { error: 'Internal Server Error' }
        }
      })
    })
  })

  describe('token refresh flow', () => {
    beforeEach(() => {
      localStorageMock.setItem('refreshToken', 'valid-refresh-token')
      localStorageMock.setItem('accessToken', 'expired-access-token')
      setAuthTokens('expired-access-token', 'valid-refresh-token')
    })

    it('should not attempt refresh when no refresh token exists', async () => {
      localStorageMock.removeItem('refreshToken')
      clearAuthTokens()
      mock.onGet('/protected').reply(401)

      await expect(axiosInstance.get('/protected')).rejects.toMatchObject({
        response: { status: 401 }
      })

      expect(mockAxios.history.post).toHaveLength(0)
    })

    it('should refresh token and retry original request on 401 error', async () => {
      const newAccessToken = 'new-access-token'

      mockAxios
        .onPost(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/refresh/`)
        .reply(200, { access: newAccessToken })

      mock.onGet('/protected').replyOnce(401)
      mock.onGet('/protected').replyOnce(200, { message: 'Retried success' })

      const response = await axiosInstance.get('/protected')

      expect(response.status).toBe(200)
      expect(response.data).toEqual({ message: 'Retried success' })
      expect(toast.success).toHaveBeenCalledWith('Sesi diperbarui, silakan coba lagi')
    })

    it('should redirect to /login if refresh token fails', async () => {
      delete (window as any).location
      ;(window as any).location = { href: '' }

      mockAxios
        .onPost(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/refresh/`)
        .reply(401)

      mock.onGet('/protected').reply(401)

      await expect(axiosInstance.get('/protected')).rejects.toMatchObject({
        response: { status: 401 }
      })

      expect(toast.error).toHaveBeenCalledWith('Sesi telah berakhir. Silakan login kembali.')
      expect(window.location.href).toBe('/login')
    })
  })

  describe('request interceptor', () => {
    it('should not set Authorization header if no access token is set', async () => {
      clearAuthTokens()
      mock.onGet('/open').reply((config) => {
        expect(config.headers?.Authorization).toBeUndefined()
        return [200, { open: true }]
      })

      await axiosInstance.get('/open')
    })

    it('should set Authorization header if access token is set', async () => {
      setAuthTokens('token-abc', 'refresh-xyz')

      mock.onGet('/secure').reply((config) => {
        expect(config.headers?.Authorization).toBe('Bearer token-abc')
        return [200, { secure: true }]
      })

      await axiosInstance.get('/secure')
    })
  })

  describe('token management functions', () => {
    it('setAuthTokens should store access and refresh tokens', async () => {
      setAuthTokens('access-123', 'refresh-456')

      mock.onGet('/test').reply((config) => {
        expect(config.headers?.Authorization).toBe('Bearer access-123')
        return [200, {}]
      })

      await axiosInstance.get('/test')
    })

    it('clearAuthTokens should remove tokens and not send Authorization header', async () => {
      clearAuthTokens()

      mock.onGet('/test-clear').reply((config) => {
        expect(config.headers?.Authorization).toBeUndefined()
        return [200, {}]
      })

      await axiosInstance.get('/test-clear')
    })
  })
})
