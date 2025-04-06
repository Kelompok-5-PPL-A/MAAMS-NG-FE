import axios from 'axios'
import { refreshToken } from '../actions/auth'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'

const axiosInstance = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_BASE_URL}`
})

axiosInstance.interceptors.request.use(
  (config) => {
    const access = localStorage.getItem('accessToken')

    if (access) {
      if (config.headers) config.headers.authorization = `Bearer ${access}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

axiosInstance.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const refresh = localStorage.getItem('refreshToken')

    if (refresh && error.response.status == '401') {
      try {
        const responseRefresh = await refreshToken(refresh)
        window.localStorage.setItem('accessToken', responseRefresh.data.access!)
        toast.error('Sesi anda telah diperbaharui. Silakan coba lagi')
        useRouter().reload()
      } catch {
        toast.error('Sesi anda telah berakhir. Silakan login kembali')
        localStorage.clear()
        useRouter().push('/login-google/')
      }
    } else {
      return Promise.reject(error)
    }
  }
)

export default axiosInstance
