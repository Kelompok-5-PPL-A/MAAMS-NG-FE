import axios from 'axios';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';

// Create the base axios instance
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
});

// Create a custom hook to get an authenticated axios instance
export const useAuthAxios = () => {
  const { data: session } = useSession();
  
  // Set up the auth interceptor
  const authAxios = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  });
  
  // Add auth header to requests if token exists
  authAxios.interceptors.request.use(
    (config) => {
      if (session?.access_token) {
        config.headers = config.headers || {};
        config.headers['Authorization'] = `Bearer ${session.access_token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
  
  // Handle 401 errors and token refresh
  authAxios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      
      if (error.response?.status === 401 && session?.refresh_token && !originalRequest._retry) {
        originalRequest._retry = true;
        
        try {
          const res = await axios.post(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/refresh/`,
            { refresh: session.refresh_token }
          );
          
          const newAccessToken = res.data.access;
          toast.success('Sesi diperbarui, silakan coba lagi');
          
          // Update the header for the retry
          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
          return authAxios(originalRequest);
        } catch (refreshErr) {
          toast.error('Sesi telah berakhir. Silakan login kembali.');
          window.location.href = '/login';
          return Promise.reject(refreshErr);
        }
      }
      
      return Promise.reject(error);
    }
  );
  
  return authAxios;
};

// Export the non-auth instance for scenarios that don't need auth
export default axiosInstance;