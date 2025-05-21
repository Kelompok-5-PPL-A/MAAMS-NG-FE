import axiosInstance from '../../services/axiosInstance'
import MockAdapter from 'axios-mock-adapter'
import toast from 'react-hot-toast'
import { getSession, signOut } from 'next-auth/react'

jest.mock('next-auth/react')
jest.mock('react-hot-toast', () => ({
  error: jest.fn(),
  success: jest.fn(),
  dismiss: jest.fn(),
  loading: jest.fn()
}))

describe('axiosInstance', () => {
  let mock: MockAdapter

  beforeEach(() => {
    mock = new MockAdapter(axiosInstance)
    jest.clearAllMocks()
    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: { href: '' },
      writable: true
    })
  })

  afterEach(() => {
    mock.reset()
  })

  describe('request interceptor', () => {
    it('should not set Authorization header if no access token exists', async () => {
      (getSession as jest.Mock).mockResolvedValueOnce(null)

      mock.onGet('/open').reply((config) => {
        expect(config.headers?.Authorization).toBeUndefined()
        return [200, { open: true }]
      })

      await axiosInstance.get('/open')
    })

    it('should not throw if config.headers is undefined', async () => {
      (getSession as jest.Mock).mockResolvedValueOnce({ accessToken: 'abc-token' })
    
      const requestInterceptor = (axiosInstance.interceptors.request as any).handlers[0].fulfilled
    
      const config = await requestInterceptor({})  
      expect(config.headers?.authorization).toBeUndefined()
    })
  })

  describe('response interceptor', () => {
    it('should handle 401 error by logging out and redirecting', async () => {
      (getSession as jest.Mock).mockResolvedValueOnce({ accessToken: 'expired-token' })
      const signOutMock = signOut as jest.Mock
      signOutMock.mockResolvedValueOnce(undefined)

      mock.onGet('/unauthorized').reply(401)

      await expect(axiosInstance.get('/unauthorized')).rejects.toMatchObject({
        response: { status: 401 }
      })

      expect(toast.error).toHaveBeenCalledWith('Sesi anda telah berakhir. Silakan login kembali')
      expect(signOutMock).toHaveBeenCalledWith({ redirect: false })
      expect(window.location.href).toBe('/login')
    })

    it('should pass through non-401 errors', async () => {
      mock.onGet('/error').reply(500, { error: 'Server error' })

      await expect(axiosInstance.get('/error')).rejects.toMatchObject({
        response: {
          status: 500,
          data: { error: 'Server error' }
        }
      })

      expect(toast.error).not.toHaveBeenCalled()
      expect(signOut).not.toHaveBeenCalled()
    })
  })

  describe('successful request', () => {
    it('should return data correctly', async () => {
      (getSession as jest.Mock).mockResolvedValueOnce({ accessToken: 'abc-token' })

      const responseData = { message: 'OK' }
      mock.onGet('/success').reply(200, responseData)

      const res = await axiosInstance.get('/success')
      expect(res.status).toBe(200)
      expect(res.data).toEqual(responseData)
    })

    it('should set Authorization header if access token exists', async () => {
      (getSession as jest.Mock).mockResolvedValueOnce({ accessToken: 'test-token' })
    
      mock.onGet('/auth-required').reply((config) => {
        expect(config.headers?.authorization).toBe('Bearer test-token')
        return [200, { authorized: true }]
      })
    
      await axiosInstance.get('/auth-required')
    })
  })
})
