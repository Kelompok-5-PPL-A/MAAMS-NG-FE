import MainLayout from '../../layout/MainLayout';
import maams from '../../assets/maams.png';
import google from '../../assets/google.png';
import ui from '../../assets/ui.png';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { useEffect, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useAuth } from "@/hooks/useAuth";

const Login: React.FC = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { user, session, isAuthenticated } = useAuth();

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await signIn('google');
      localStorage.setItem('isLoggedIn', 'true');
    } catch (error) {
      toast.error('Failed to login with Google');
      console.error('Google login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      try {
        localStorage.setItem("userData", JSON.stringify(session?.user))
        localStorage.setItem("accessToken", user?.access_token!)
        localStorage.setItem("refreshToken", user?.refresh_token!)
        toast.success(`Welcome, ${user?.name!}!`, {
          duration: 4500,
          position: 'top-center',
          icon: '👋',
        });
        router.push("/");
      } catch (error) {
        toast.error('Gagal menyimpan data login');
        console.error('Local storage error:', error);
      }
    }
  }, [isAuthenticated, isLoading, router, user]);

  return (
    <MainLayout>
       <a href='/' className='mb-6 flex items-center justify-center'>
         <img src={maams.src} className='h-386 w-386' alt='Maams Auth' />
       </a>

       <div className='flex flex-col items-center justify-center'>
         <h1 className='text-2xl font-bold'>Masuk ke Akun</h1>
       </div>

       <div className='flex flex-col items-center justify-center mt-5'>
         <button 
         onClick={handleGoogleLogin}
         className='md:flex md:gap-2 md:items-center md:justify-center block py-2 bg-yellow-500 text-white md:border-0 md:p-2 md:rounded-xl md:w-80'
         >
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
  );
};

export default Login;