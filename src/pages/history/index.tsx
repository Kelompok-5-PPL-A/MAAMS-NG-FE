import React, { useEffect, useState } from 'react'
import axiosInstance from '../../services/axiosInstance'
import { ValidatorData } from '../../components/types/validatorQuestionFormProps'
import Mode from '../../constants/mode'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'
import { SearchBar } from '../../components/searchBar'
import Section from '../../components/sectionHistory'
import MainLayout from '../../layout/MainLayout'

const History: React.FC = () => {
  const { data: session } = useSession()
  const router = useRouter()

  const [lastweek, setLastWeek] = useState<ValidatorData[]>([])
  const [older, setOlder] = useState<ValidatorData[]>([])
  const [filter, setFilter] = useState<string>('semua')
  const [keyword, setKeyword] = useState<string>('')
  const [suggestion, setSuggestion] = useState<string[]>([])
  const [filterData, setFilterData] = useState<any>()

  const fetchData = async (additionalParam: string) => {
    try {
      const [lastWeekRes, olderRes, filterRes] = await Promise.all([
        axiosInstance.get(`/question/last_week/${additionalParam}`),
        axiosInstance.get(`/question/older/${additionalParam}`),
        axiosInstance.get(`/question/filter/`),
      ])
      setLastWeek(lastWeekRes.data.processedData)
      setOlder(olderRes.data.processedData)
      setFilterData(filterRes.data)
    } catch (error: any) {
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
    const query = `search/?filter=${filter}&count=4&keyword=${keyword}`
    fetchData(query)
    router.push({
      pathname: router.pathname,
      query: { keyword },
    })
  }

  const isAdmin = typeof window !== 'undefined'
    ? JSON.parse(window.localStorage.getItem('userData')!)?.is_staff
    : false

  return (
    <MainLayout marginOverride='lg:mx-10 mx-0'>
      <div className='min-h-screen lg:m-12'>
        <h1 className='text-2xl font-bold mb-4 text-center mt-7 mb-7'>
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
