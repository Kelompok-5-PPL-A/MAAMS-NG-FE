import React, { useRef, useState, useEffect } from 'react'
import { useRouter } from 'next/router'

import MainLayout from '../../layout/MainLayout'

import maams from '../../assets/maams.png'

const Login: React.FC = () => {
  return (
    <MainLayout>
      <a href='/' className='mb-6 flex items-center justify-center'>
        <img src={maams.src} className='h-386 w-386' alt='Maams Auth' />
      </a>

      <div className='flex flex-col items-center justify-center'>
        <h1 className='text-2xl font-bold'>Masuk ke Akun</h1>
      </div>
    </MainLayout>
  )
}

export default Login