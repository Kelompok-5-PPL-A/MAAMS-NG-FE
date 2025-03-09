import axios from 'axios'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'

const axiosInstance = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_BASE_URL}`
})

axiosInstance.interceptors.request.use(
  (config) => {
    const access = localStorage.getItem('access')

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
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      toast.error('Sesi anda telah berakhir. Silakan login kembali')
      localStorage.clear()
      useRouter().push('/login')
    }
    return Promise.reject(error)
  }
)

export default axiosInstance
