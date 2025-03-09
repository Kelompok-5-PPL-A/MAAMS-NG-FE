// since now we still dont have the auth service, we will mock the localstorage and the toast
// but when we have the auth service, remove the mock and use the real one using sso (adjust this code)
import axios from 'axios'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'
import axiosInstance from '../../services/axiosInstance'

jest.mock('next/router', () => ({
  useRouter: jest.fn()
}))
jest.mock('react-hot-toast', () => ({
  error: jest.fn()
}))

describe('axiosInstance', () => {
  afterEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  it('should add Authorization header when access token exists', async () => {
    const token = 'mockAccessToken'
    jest.spyOn(localStorage.__proto__, 'getItem').mockReturnValue(token)

    const config = await axiosInstance.interceptors.request.handlers[0].fulfilled({ headers: {} })

    expect(config.headers.authorization).toBe(`Bearer ${token}`)
  })

  it('should not add Authorization header when access token does not exist', async () => {
    jest.spyOn(localStorage.__proto__, 'getItem').mockReturnValue(null)

    const config = await axiosInstance.interceptors.request.handlers[0].fulfilled({ headers: {} })

    expect(config.headers.authorization).toBeUndefined()
  })

  it('should show error toast and redirect on 401 response', async () => {
    const mockPush = jest.fn()
    ;(useRouter as jest.Mock).mockReturnValue({ push: mockPush })
    jest.spyOn(localStorage, 'clear')

    const error = {
      response: { status: 401 }
    }

    await axiosInstance.interceptors.response.handlers[0].rejected(error)

    expect(toast.error).toHaveBeenCalledWith('Sesi anda telah berakhir. Silakan login kembali')
    expect(localStorage.clear).toHaveBeenCalled()
    expect(mockPush).toHaveBeenCalledWith('/login')
  })
})
