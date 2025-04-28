import React, { useState, useEffect } from 'react'
import MainLayout from '../../../layout/MainLayout'
import Section from '../../../components/sectionHistory'
import Pagination from '../../../components/pagination'
import { Item } from '../../../components/types/historyPage'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'
import { SearchBar } from '../../../components/searchBar'
import { FilterData } from '../../../components/types/filterData'
import { fetchQuestions } from '@/actions/fetchQuestion'
import fetchFilters from '@/actions/fetchFilters'

const LastWeek: React.FC = () => {
  const { data: session, status } = useSession()
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState<number>(1)

  const [lastweek, setLastWeek] = useState<Item[]>([])
  const [keyword, setKeyword] = useState<string>('')
  const [filter, setFilter] = useState<string>('semua')
  const [submitted, setSubmitted] = useState<boolean>(false)
  const [filterData, setFilterData] = useState<FilterData>()
  const [suggestion, setSuggestion] = useState<string[]>([])

  const router = useRouter()

  const fetchData = async (queryParams: string) => {
    try {
      const [lastWeekData] = await Promise.all([
        await fetchQuestions('last_week', queryParams),
      ])
      
      setLastWeek(lastWeekData.processedData)
      setTotalPages(Math.ceil(lastWeekData.count / 4))

      const filterRes = await fetchFilters()
      setFilterData(filterRes)
    } catch (error: any) {
      toast.error('Terjadi kesalahan saat mengambil data')
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
    if (status !== 'authenticated') return

    const fetchDataBasedOnQuery = async () => {
      const { keyword } = router.query
      const page = submitted ? 1 : currentPage
      if (keyword && typeof keyword === 'string') {
        setKeyword(keyword)
        fetchData(`search/?filter=${filter}&count=5&keyword=${keyword}&p=${page}`)
        if (submitted) {
          setSubmitted(false)
          setCurrentPage(1)
        }
      } else {
        fetchData(`?filter=${filter}&count=4&p=${currentPage}`)
      }
    }

    fetchDataBasedOnQuery()
  }, [router.query, currentPage, session, status])

  if (status === 'loading') {
    return (
      <MainLayout>
        <div className='min-h-screen flex items-center justify-center'>
          <p className='text-lg font-medium'>Memuat...</p>
        </div>
      </MainLayout>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <MainLayout>
        <div className='min-h-screen flex items-center justify-center'>
          <p className='text-lg font-medium'>Mohon login terlebih dahulu untuk melihat riwayat.</p>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout marginOverride='lg:mx-10 mx-0'>
      <div className='min-h-screen lg:m-12'>
        <h1 data-testid='history-title' className='text-2xl font-bold mb-4 text-center mt-7 mb-7'>
          Riwayat Analisis
        </h1>
        <SearchBar
          keyword={keyword}
          suggestions={suggestion}
          onSelect={handleFilterSelect}
          onChange={(value) => setKeyword(value)}
          onSubmit={handleSubmit} isAdmin={false} publicAnalyses={false}        />
        <Section
          title='7 hari terakhir'
          items={lastweek}
          showModeButton={true}
          showDeleteButton={true}
          keyword=''
        />
        {totalPages >= 1 && (
          <Pagination currentPage={currentPage} onPageChange={setCurrentPage} totalPages={totalPages} />
        )}
      </div>
    </MainLayout>
  )
}

export default LastWeek
