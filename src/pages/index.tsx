import React from 'react'
import FAQ from '../components/faq'
import HeaderIntro from '../components/headerIntro'
import MainLayout from '../layout/MainLayout'
import CreateLanding from '../components/CreateLanding'
import RecentAnalysis from '../components/recentAnalysis'

const Index = () => {
  return (
    <MainLayout marginOverride='m-0'>
      <HeaderIntro />
      <CreateLanding />
      <RecentAnalysis />
      <FAQ />
    </MainLayout>
  )
}

export default Index