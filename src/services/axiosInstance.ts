import axios from 'axios'
import toast from 'react-hot-toast'

let accessToken: string | null = null
let refreshTokenValue: string | null = null

export const setAuthTokens = (access: string, refresh: string) => {
  accessToken = access
  refreshTokenValue = refresh
}

export const clearAuthTokens = () => {
  accessToken = null
  refreshTokenValue = null
}

const refreshToken = async (refresh: string) => {
  const res = await axios.post(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/refresh/`,
    { refresh }
  )
  return res.data
}

const axiosInstance = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_BASE_URL}`,
})

axiosInstance.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers = config.headers || {};
      (config.headers as any).set('Authorization', `Bearer ${accessToken}`);
    }
    return config
  },
  (error) => Promise.reject(error)
)

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (
      error.response?.status === 401 &&
      refreshTokenValue
    ) {
      try {
        const data = await refreshToken(refreshTokenValue)
        accessToken = data.access
        toast.success('Sesi diperbarui, silakan coba lagi')

        const originalRequest = error.config
        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return axiosInstance(originalRequest)
      } catch (refreshErr) {
        toast.error('Sesi telah berakhir. Silakan login kembali.')
        clearAuthTokens()
        window.location.href = '/login'
        return Promise.reject(refreshErr)
      }
    }

    return Promise.reject(error)
  }
)

export default axiosInstance
