import { FilterData } from '../components/types/filterData'
import axiosInstance from '@/services/axiosInstance'

export const fetchFilters = async () => {
  const url = `api/v1/question/history/field-values/`

  const response = await axiosInstance.get(url)

  const data: FilterData = {
    pengguna: response.data.pengguna,
    judul: response.data.judul,
    topik: response.data.topik
  }

  return data
}

export default fetchFilters