import React, { useState, useEffect } from 'react'
import MainLayout from '../../../layout/MainLayout'
import Section from '../../../components/sectionHistory'
import Pagination from '../../../components/pagination'
import { Item } from '../../../components/types/historyPage'
import { SearchBar } from '../../../components/searchBar'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import toast from 'react-hot-toast'
import axiosInstance from '../../../services/axiosInstance'
import { formatTimestamp } from '../../../utils/dateFormatter'
import { FilterData } from '../../../components/types/filterData'

const PastWeek: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState<number>(1)
  const [submitted, setSubmitted] = useState<boolean>(false)
  const [older, setOlder] = useState<Item[]>([])
  const [keyword, setKeyword] = useState<string>('')
  const [filter, setFilter] = useState<string>('semua')
  const [filterData, setFilterData] = useState<FilterData>()
  const [suggestion, setSuggestion] = useState<string[]>([])

  const router = useRouter()
  const { data: session, status } = useSession()

  const isAdmin = typeof window !== 'undefined'
    ? JSON.parse(window.localStorage.getItem('userData')!)?.is_staff
    : false

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const fetchData = async (additional_param: string) => {
    try {
      const [pastWeekRes, filterRes] = await Promise.all([
        axiosInstance.get(`/question/last_week/older/${additional_param}`),
        axiosInstance.get(`/question/filter/`)
      ])

      const pastWeekData = pastWeekRes.data
      const processedData: Item[] = pastWeekData.results.map((item: any) => ({
        id: item.id,
        title: item.question,
        displayed_title: item.title,
        timestamp: formatTimestamp(item.created_at),
        mode: item.mode,
        user: item.username,
        tags: item.tags
      }))
      setOlder(processedData)
      setTotalPages(Math.ceil(pastWeekData.count / 4))
      setFilterData(filterRes.data)
    } catch (error: any) {
      toast.error(error.response?.data?.detail || error.message || 'Terjadi kesalahan')
      router.push('/')
    }
  }

  const handleFilterSelect = (filter: string) => {
    setFilter(filter)
    if (filter === 'Pengguna') {
      setSuggestion(filterData?.pengguna || [])
    } else if (filter === 'Judul') {
      setSuggestion(filterData?.judul || [])
    } else if (filter === 'Topik') {
      setSuggestion(filterData?.topik || [])
    } else {
      setSuggestion([])
    }
  }

  const handleSubmit = () => {
    setSubmitted(true)
    router.push({
      pathname: router.pathname,
      query: { keyword: keyword }
    })
  }

  useEffect(() => {
    const fetchDataBasedOnQuery = async () => {
      const { keyword } = router.query
      const page = submitted ? 1 : currentPage

      if (keyword && typeof keyword === 'string') {
        setKeyword(keyword)
        await fetchData(`search/?filter=${filter}&&count=5&keyword=${keyword}&p=${page}`)
        if (submitted) {
          setSubmitted(false)
          setCurrentPage(1)
        }
      } else {
        await fetchData(`?filter=${filter}&count=4&p=${currentPage}`)
      }
    }

    if (status === 'authenticated') {
      fetchDataBasedOnQuery()
    }
  }, [router.query, currentPage, status])

  if (status === 'loading') return <div>Memuat...</div>
  if (status === 'unauthenticated') return <div>Mohon login terlebih dahulu</div>

  return (
    <MainLayout marginOverride='lg:mx-10 mx-0'>
      <div className='min-h-screen lg:m-12'>
        <h1 data-testid='history-title' className='text-2xl font-bold mb-4 text-center mt-7 mb-7'>
          Riwayat Analisis
        </h1>
        <SearchBar
          isAdmin={isAdmin}
          publicAnalyses={false}
          keyword={keyword}
          suggestions={suggestion}
          onSelect={handleFilterSelect}
          onSubmit={handleSubmit}
          onChange={(value) => setKeyword(value)}
        />
        <Section title='Lebih lama' items={older} showModeButton={true} showDeleteButton={true} keyword='' />
        {totalPages >= 1 && (
          <Pagination currentPage={currentPage} onPageChange={handlePageChange} totalPages={totalPages} />
        )}
      </div>
    </MainLayout>
  )
}

export default PastWeek
