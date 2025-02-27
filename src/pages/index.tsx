import React from 'react'
import FAQ from '../components/faq'
import HeaderIntro from '../components/headerIntro'
import MainLayout from '../layout/MainLayout'

const Index = () => {
  return (
    <MainLayout marginOverride='m-0'>
      <HeaderIntro />
      <FAQ />
    </MainLayout>
  )
}

export default Index