import axios from 'axios'
import toast from 'react-hot-toast'

const axiosInstance = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_BASE_URL}`
})

axiosInstance.interceptors.request.use(
  (config) => {
    const access = localStorage.getItem('access')
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'

    if (access && isLoggedIn) {
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
    const refresh = localStorage.getItem('refresh')

    if (refresh && error.response.status == '401') {
      try {
        toast.error('Sesi anda telah diperbaharui. Silakan coba lagi')
        window.location.href = '/login'
      } catch {
        toast.error('Sesi anda telah berakhir. Silakan login kembali')
        localStorage.clear()
        window.location.href = '/login'
      }
    } else {
      return Promise.reject(error)
    }
  }
)

export default axiosInstance