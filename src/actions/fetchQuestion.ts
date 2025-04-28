import { formatTimestamp } from '../utils/dateFormatter'
import { Item } from '../components/types/historyPage'
import axiosInstance from '@/services/axiosInstance'

interface historyData {
  count: number
  previous: string
  next: string
  results: Item[]
}

export const fetchQuestions = async (time_range?: string, additional_param?: string) => {
  let url = `/question/history/${additional_param}&time_range=${time_range}`

  const response = await axiosInstance.get(url)

  const data: historyData = response.data
  console.log(data)

  const processedData: Item[] = data.results.map((item: any) => ({
    id: item.id,
    title: item.question,
    displayed_title: item.title,
    timestamp: formatTimestamp(item.created_at),
    mode: item.mode,
    user: item.username,
    tags: item.tags
  }))

  return {
    count: data.count,
    processedData: processedData
  }
}


