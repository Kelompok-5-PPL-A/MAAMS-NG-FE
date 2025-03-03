import React, { ReactNode } from 'react'
import Head from 'next/head'

type MainLayoutProps = {
  children: ReactNode
  marginOverride?: string
}

const MainLayout = ({ children, marginOverride = 'm-10' }: MainLayoutProps) => {
  return (
    <div>
      <Head>
        <title>MAAMS</title>
        <meta
          name='description'
          content='MAAMS menggunakan algoritma analisis untuk memvalidasi sebab-sebab masalah yang diinput oleh pengguna, membantu menemukan akar masalah dengan lebih tepat.'
        />
        <meta name='author' content='Ari Harsono'></meta>
        <meta name='keywords' content='Akar, Masalah, Analisis, Validasi, '></meta>
        <link rel='icon' href='/icons/meta-icon.svg' />
      </Head>
      <div className={`min-h-screen ${marginOverride}`}>{children}</div>
    </div>
  )
}

export default MainLayout