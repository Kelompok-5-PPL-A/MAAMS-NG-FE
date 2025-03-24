import ListItem from '../../components/itemListHistory'
import React, { useEffect, useState } from 'react'
import axiosInstance from '../../services/axiosInstance'
import { ValidatorData } from '../../components/types/validatorQuestionFormProps'
import Mode from '../../constants/mode'
import { formatTimestamp } from '../../utils/dateFormatter'
import toast from 'react-hot-toast'

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
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isSSOLoggedIn, setIsSSOLoggedIn] = useState(false) // Tambahkan state untuk SSO UI
  const [recentData, setRecentData] = useState<ValidatorData>(defaultValidatorData)

  useEffect(() => {
    const googleAuth = localStorage.getItem('isLoggedIn') // Cek login Google OAuth
    const ssoAuth = localStorage.getItem('isSSOLoggedIn') // Cek login SSO UI

    const handleGet = async () => {
      try {
        const response = await axiosInstance.get(`/api/v1/validator/recent/`)
        const receivedData: ValidatorData = response.data
        setRecentData(receivedData)
      } catch {
        toast.error('Gagal mengambil data')
      }
    }

    setIsLoggedIn(googleAuth === 'true')
    setIsSSOLoggedIn(ssoAuth === 'true')

    if (googleAuth === 'true' || ssoAuth === 'true') {
      handleGet()
    }
  }, [])

  return (
    <>
      {(isLoggedIn || isSSOLoggedIn) && recentData?.id != null && (
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
