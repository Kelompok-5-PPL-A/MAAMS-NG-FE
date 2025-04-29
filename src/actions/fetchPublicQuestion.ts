import { formatTimestamp } from '../utils/dateFormatter'
import { Item } from '@/components/types/historyPage'
import axiosInstance from '@/services/axiosInstance'

interface historyData {
  count: number
  previous: string
  next: string
  results: Item[]
}

export const fetchPublicQuestions = async (queryParams?: string, token?: string) => {
  let url = `/question/privileged/${queryParams}`

  const response = await axiosInstance.get(url)

  const data: historyData = response.data

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
    processedData
  }
}
