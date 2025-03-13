import axios from 'axios'

const axiosInstance = axios.create({
  baseURL: "http://34.87.35.100:8000"
})

export default axiosInstance
