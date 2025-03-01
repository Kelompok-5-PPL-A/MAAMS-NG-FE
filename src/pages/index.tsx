import React from 'react'
import FAQ from '../components/faq'
import HeaderIntro from '../components/headerIntro'
import MainLayout from '../layout/MainLayout'
import CreateLanding from '../components/CreateLanding'

const Index = () => {
  return (
    <MainLayout marginOverride='m-0'>
      <HeaderIntro />
      <CreateLanding />
      <FAQ/>
    </MainLayout>
  )
}

export default Index