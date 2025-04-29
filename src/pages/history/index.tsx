import React, { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'
import { SearchBar } from '../../components/searchBar'
import Section from '../../components/sectionHistory'
import MainLayout from '../../layout/MainLayout'
import { fetchQuestions } from '@/actions/fetchQuestion'
import fetchFilters from '@/actions/fetchFilters'
import { Item } from '@/components/types/historyPage'

const History: React.FC = () => {
  const { data: session } = useSession()
  const router = useRouter()

  const [lastweek, setLastWeek] = useState<Item[]>([])
  const [older, setOlder] = useState<Item[]>([])
  const [filter, setFilter] = useState<string>('semua')
  const [keyword, setKeyword] = useState<string>('')
  const [suggestion, setSuggestion] = useState<string[]>([])
  const [filterData, setFilterData] = useState<any>()

  const fetchData = async (queryParams: string) => {
    try {
      const [lastWeekRes, olderRes] = await Promise.all([
        (await fetchQuestions('last_week', queryParams)).processedData,
        (await fetchQuestions('older', queryParams)).processedData,
      ])
      setLastWeek(lastWeekRes)
      setOlder(olderRes)

      const filterRes = await fetchFilters()
      setFilterData(filterRes)
    } catch (error) {
      toast.error('Terjadi kesalahan saat mengambil data')
      router.push('/')
    }
  }

  useEffect(() => {
    if (session?.accessToken) {
      fetchData('?count=4')
    }
  }, [session?.accessToken])

  const handleFilterSelect = (selected: string) => {
    setFilter(selected)
    if (selected === 'Pengguna') {
      setSuggestion(filterData?.pengguna || [])
    } else if (selected === 'Judul') {
      setSuggestion(filterData?.judul || [])
    } else if (selected === 'Topik') {
      setSuggestion(filterData?.topik || [])
    } else {
      setSuggestion([])
    }
  }

  const handleSubmit = () => {
    router.push({
      pathname: router.pathname,
      query: { keyword },
    })

    const query = `search/?filter=${filter}&count=4&keyword=${keyword}`
    fetchData(query)
  }

  if (!session) {
    return (
      <MainLayout marginOverride='lg:mx-10 mx-0'>
        <div className='min-h-screen flex items-center justify-center'>
          <p className='text-lg font-medium'>Mohon login terlebih dahulu untuk melihat riwayat.</p>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout marginOverride='lg:mx-10 mx-0'>
      <div className='min-h-screen lg:m-12'>
        <h1 className='text-2xl font-bold text-center mt-7 mb-7'>
          Riwayat Analisis
        </h1>
        <SearchBar
          keyword={keyword}
          suggestions={suggestion}
          onSelect={handleFilterSelect}
          onChange={(value) => setKeyword(value)}
          onSubmit={handleSubmit} isAdmin={false} publicAnalyses={false}        />
        {lastweek.length > 0 && (
          <Section
            title='7 hari terakhir'
            items={lastweek}
            seeMoreLink='/history/lastWeek'
            showModeButton
            keyword={keyword}
            showDeleteButton
          />
        )}
        {older.length > 0 && (
          <Section
            title='Lebih lama'
            items={older}
            seeMoreLink='/history/pastWeek'
            showModeButton
            keyword={keyword}
            showDeleteButton
          />
        )}
      </div>
    </MainLayout>
  )
}

export default History
