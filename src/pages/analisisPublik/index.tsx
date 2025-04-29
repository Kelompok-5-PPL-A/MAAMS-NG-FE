import React, { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'
import MainLayout from '../../layout/MainLayout'
import { SearchBar } from '../../components/searchBar'
import AdminTable from '../../components/adminTable'
import Pagination from '../../components/pagination'
import { fetchPublicQuestions } from '@/actions/fetchPublicQuestion'
import fetchFilters from '@/actions/fetchFilters'
import { Item } from '@/components/types/historyPage'

const AnalisisPublik: React.FC = () => {
  const { data: session } = useSession()
  const router = useRouter()

  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState<number>(1)
  const [data, setData] = useState<Item[]>([])

  const [filter, setFilter] = useState<string>('semua')
  const [keyword, setKeyword] = useState<string>('')
  const [submitted, setSubmitted] = useState<boolean>(false)
  const [filterData, setFilterData] = useState<any>()
  const [suggestion, setSuggestion] = useState<string[]>([])

  const fetchData = async (queryParams: string) => {
    try {
      const processedData = await fetchPublicQuestions(queryParams, session?.accessToken)
      setData(processedData.processedData)
      setTotalPages(Math.ceil(processedData.count / 5))

      const filterRes = await fetchFilters()
      setFilterData(filterRes)
    } catch (error: any) {
      if (error.response?.status === 403) {
        toast.error('Anda tidak memiliki akses ke halaman ini.')
        router.push('/')
      } else {
        toast.error('Terjadi kesalahan saat mengambil data')
        router.push('/')
      }
    }
  }

  useEffect(() => {
    if (session?.accessToken) {
      const { keyword } = router.query
      const page = submitted ? 1 : currentPage

      if (keyword && typeof keyword === 'string') {
        setKeyword(keyword)
        fetchData(`privileged/?filter=${filter}&count=5&keyword=${keyword}&p=${page}`)
        if (submitted) {
          setSubmitted(false)
          setCurrentPage(1)
        }
      } else {
        fetchData(`privileged/?count=5&p=${currentPage}`)
      }
    }
  }, [session?.accessToken, router.query, currentPage])

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
    setSubmitted(true)
    router.push({
      pathname: router.pathname,
      query: { keyword },
    })

    const query = `search/?filter=${filter}&count=4&keyword=${keyword}`
    fetchData(query)
  }

  if (!session) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-lg font-medium">Mohon login terlebih dahulu untuk melihat analisis publik.</p>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="min-h-screen m-12">
        <h1 data-testid="public-analysis-title" className="text-2xl font-bold mb-4 text-center mt-7 mb-7">
          Analisis Publik
        </h1>
        <SearchBar
          keyword={keyword}
          suggestions={suggestion}
          onSelect={handleFilterSelect}
          onSubmit={handleSubmit}
          onChange={(value) => setKeyword(value)}
          publicAnalyses={true}
          isAdmin={true}
        />
        <AdminTable data={data} />
        {totalPages >= 1 && (
          <Pagination currentPage={currentPage} onPageChange={(page) => setCurrentPage(page)} totalPages={totalPages} />
        )}
      </div>
    </MainLayout>
  )
}

export default AnalisisPublik
