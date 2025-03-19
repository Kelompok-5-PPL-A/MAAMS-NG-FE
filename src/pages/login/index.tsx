import MainLayout from '../../layout/MainLayout'

import maams from '../../assets/maams.png'
import google from '../../assets/google.png'
import ui from '../../assets/ui.png'

const Login: React.FC = () => {
  return (
    <MainLayout>
      <a href='/' className='mb-6 flex items-center justify-center'>
        <img src={maams.src} className='h-386 w-386' alt='Maams Auth' />
      </a>

      <div className='flex flex-col items-center justify-center'>
        <h1 className='text-2xl font-bold'>Masuk ke Akun</h1>
      </div>

      <div className='flex flex-col items-center justify-center mt-5'>
        <button className='md:flex md:gap-2 md:items-center md:justify-center block py-2 bg-yellow-500 text-white md:border-0 md:p-2 md:rounded-xl md:w-80'>
          <img src={google.src} alt='Google Logo' className='w-10 h-10' />{' '}
          Masuk dengan Google
        </button>
      
        <div className='flex flex-col items-center justify-center mt-4'>
        <button className='md:flex md:gap-2 md:items-center md:justify-center block py-2 bg-yellow-500 text-white md:border-0 md:p-2 md:rounded-xl md:w-80'>
          <img src={ui.src} alt='UI Logo' className='w-10 h-10' />{' '}
            Masuk dengan SSO UI
          </button>
        </div>
      </div>
    </MainLayout>
  )
}

export default Login