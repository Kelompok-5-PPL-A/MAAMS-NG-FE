// since now we still dont have the auth service, we will mock the localstorage and the toast
// but when we have the auth service, remove the mock and use the real one using sso (adjust this code)
import axiosInstance from '../../services/axiosInstance'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'
import { NextRouter } from 'next/router'

// Mock dependencies
jest.mock('next/router', () => ({
    useRouter: jest.fn(),
  }))
  
  jest.mock('react-hot-toast', () => ({
    error: jest.fn(),
  }))
  
  describe('axiosInstance', () => {
    let mockAxios: MockAdapter 
    let mockRouter: NextRouter
  
    beforeEach(() => {
      mockAxios = new MockAdapter(axiosInstance)
  
      // Create a mock implementation of NextRouter
      mockRouter = {
        push: jest.fn(),
        replace: jest.fn(),
        prefetch: jest.fn(),
        pathname: '/',
        route: '/',
        query: {},
        asPath: '/',
        basePath: '',
        isLocaleDomain: false,
        isReady: true,
        isPreview: false,
        events: {
          on: jest.fn(),
          off: jest.fn(),
          emit: jest.fn(),
        },
      } as unknown as NextRouter
  
      ;(useRouter as jest.Mock).mockReturnValue(mockRouter) // Type assertion
  
      localStorage.clear()
    })
  
    afterEach(() => {
      mockAxios.reset()
      jest.clearAllMocks()
    })
  
    test('should set Authorization header if access token exists', async () => {
      localStorage.setItem('access', 'mockToken')
  
      mockAxios.onGet('/test').reply(200, { success: true })
  
      const response = await axiosInstance.get('/test')
  
      expect(response.status).toBe(200)
      expect(response.data).toEqual({ success: true })
  
      const requestHeaders = mockAxios.history.get[0].headers
      expect(requestHeaders?.authorization).toBe('Bearer mockToken')
    })
  
    test('should handle 401 error by clearing storage and redirecting to login', async () => {
      localStorage.setItem('access', 'mockToken')
  
      mockAxios.onGet('/test').reply(401)
  
      await expect(axiosInstance.get('/test')).rejects.toThrow()
  
      expect(toast.error).toHaveBeenCalledWith(
        'Sesi anda telah berakhir. Silakan login kembali'
      )
      expect(localStorage.getItem('access')).toBeNull()
      expect(mockRouter.push).toHaveBeenCalledWith('/login')
    })
  
    test('should return response data on successful request', async () => {
      mockAxios.onGet('/test').reply(200, { data: 'Success' })
  
      const response = await axiosInstance.get('/test')
  
      expect(response.status).toBe(200)
      expect(response.data).toEqual({ data: 'Success' })
    })
  })