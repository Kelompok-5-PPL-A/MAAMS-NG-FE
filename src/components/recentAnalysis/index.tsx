import ListItem from '../../components/itemListHistory'
import React, { useEffect, useState } from 'react'
import axiosInstance from '../../services/axiosInstance'
import { ValidatorData } from '../../components/types/validatorQuestionFormProps'
import Mode from '../../constants/mode'
import { formatTimestamp } from '../../utils/dateFormatter'
import toast from 'react-hot-toast'
import { useSession } from 'next-auth/react'

const defaultValidatorData: ValidatorData = {
  title: '',
  id: '',
  question: '',
  tags: [],
  mode: Mode.pribadi,
  created_at: '',
  username: ''
}

const RecentAnalysis: React.FC = () => {
  const [recentData, setRecentData] = useState<ValidatorData>(defaultValidatorData)
  const {data: session} = useSession()

  useEffect(() => {
    if (session?.accessToken) {
      const fetchRecentAnalysis = async () => {
        try {
          const response = await axiosInstance.get(`api/v1/question/recent/`)
          const receivedData: ValidatorData = response.data
          setRecentData(receivedData)
        } catch {
          toast.error('Gagal mengambil data')
        }
      }
      fetchRecentAnalysis()
    }
  }, [session?.accessToken])

  const shouldShow = session?.accessToken && recentData?.id

  return (
    <>
      {shouldShow && (
        <div className='flex flex-col justify-center items-center w-full gap-8 px-8 my-8'>
          <p className='text-3xl font-bold text-center text-black'>Analisis Terbaru</p>
          <div className='w-full'>
            <ListItem
              idQuestion={recentData.id}
              key='recent'
              title={recentData.title || recentData.question}
              timestamp={formatTimestamp(recentData.created_at)}
              mode={recentData.mode}
              tags={recentData.tags}
              user={recentData.username}
              showModeButton={true}
              showDeleteButton={false}
            />
          </div>
        </div>
      )}
    </>
  )
}

export default RecentAnalysis
