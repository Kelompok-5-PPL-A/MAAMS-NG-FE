import MainLayout from '../../layout/MainLayout';
import maams from '../../assets/maams.png';
import google from '../../assets/google.png';
import ui from '../../assets/ui.png';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { useEffect, useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';

const Login: React.FC = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { data: session, status } = useSession();

  const handleSSOLogin = async () => {
    setIsLoading(true);
    const serviceUrl = encodeURIComponent(`${window.location.origin}/auth/callback`);
    window.location.href = `https://sso.ui.ac.id/cas2/login?service=${serviceUrl}`;
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await signIn('google');
      localStorage.setItem('loginMethod','google')
    } catch (error) {
      toast.error('Failed to login with Google');
      console.error('Google login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated' && session) {
      router.push('/');
    }
  }, [session, status, router]);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.username) {
      toast.success(`Welcome, ${session.user.username}!`, {
        duration: 4500,
        position: 'top-center',
        icon: '👋',
      });
    }
  }, [session, status]);

  return (
    <MainLayout>
      <div data-testid="login-page" className='flex flex-col items-center justify-center'>
        <Link href='/' className='mb-6 flex items-center justify-center'>
          <Image src={maams.src} width={386} height={386} alt='Maams Auth' priority />
        </Link>
        <div className='flex flex-col items-center justify-center'>
          <h1 data-testid="login-title" className='text-2xl font-bold'>Masuk ke Akun</h1>
        </div>
        <div className='flex flex-col items-center justify-center mt-5'>
          <button
            data-testid="google-login-button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className='md:flex md:gap-2 md:items-center md:justify-center block py-2 bg-yellow-500 text-black md:border-0 md:p-2 md:rounded-xl md:w-80'
          >
            <Image src={google.src} width={40} height={40} alt='Google Logo' /> {' '}
            Masuk dengan Google
          </button>
          <div className='flex flex-col items-center justify-center mt-4'>
            <button
              data-testid="sso-login-button"
              onClick={handleSSOLogin}
              disabled={isLoading}
              className='md:flex md:gap-2 md:items-center md:justify-center block py-2 bg-yellow-500 text-black md:border-0 md:p-2 md:rounded-xl md:w-80'>
              <Image src={ui.src} width={40} height={40} alt='UI Logo' /> {' '}
              Masuk dengan SSO UI
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Login;