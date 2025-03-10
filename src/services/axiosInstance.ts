import axios from 'axios'
import toast from 'react-hot-toast'

const axiosInstance = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_BASE_URL}`
})

// For future work when we already implement authentication and authorization (in sso)
// axiosInstance.interceptors.request.use(
//   (config) => {
//     const access = localStorage.getItem('access')
//     if (access) {
//       if (config.headers) config.headers.authorization = `Bearer ${access}`
//     }
//     return config
//   },
//   (error) => {
//     return Promise.reject(new Error(error.message || 'Terjadi kesalahan pada request'))
//   }
// )

// axiosInstance.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     if (error.response?.status === 401) {
//       toast.error('Sesi anda telah berakhir. Silakan login kembali')
//       localStorage.clear()
//       window.location.href = '/login' // Ganti useRouter() dengan window.location.href
//     }
//     return Promise.reject(new Error(error.message || 'Terjadi kesalahan pada response'))
//   }
// )


export default axiosInstance
