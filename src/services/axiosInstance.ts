import axios from 'axios'
import { getSession, signOut } from 'next-auth/react'
import toast from 'react-hot-toast'

const axiosInstance = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_BASE_URL}`,
  
})

axiosInstance.interceptors.request.use(
  async (config) => {
    // Get session from NextAuth instead of localStorage
    const session = await getSession()
    
    if (session?.accessToken) {
      if (config.headers) config.headers.authorization = `Bearer ${session.accessToken}`
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
    // Check if error is due to unauthorized access
    if (error.response?.status === 401) {
      try {
        // We'll let NextAuth handle token refreshing via its built-in mechanisms
        // Instead of manually refreshing, we'll notify the user and trigger a session check
        toast.error('Sesi anda telah berakhir. Silakan login kembali')
        
        // Sign out user from NextAuth
        await signOut({ redirect: false })

        const isSsoUser = localStorage.getItem('loginMethod') === 'sso'

        localStorage.clear()

        if (isSsoUser) {
          const casLogoutURL = `https://sso.ui.ac.id/cas2/logout?service=${process.env.NEXTAUTH_URL}`;
          window.location.href = casLogoutURL;
        } else {
          window.location.href = '/login'
        }
       
        
      } catch (refreshError) {
        console.error('Session refresh error:', refreshError)
        toast.error('Terjadi kesalahan. Silakan login kembali')
        
        // Sign out user from NextAuth
        await signOut({ redirect: false })

        const isSsoUser = localStorage.getItem('loginMethod') === 'sso'

        localStorage.clear()

        if (isSsoUser) {
          const casLogoutURL = `https://sso.ui.ac.id/cas2/logout?service=${process.env.NEXTAUTH_URL}`;
          window.location.href = casLogoutURL;
        } else {
          window.location.href = '/login'
        }
      }
    }
    
    return Promise.reject(error)
  }
)

export default axiosInstance