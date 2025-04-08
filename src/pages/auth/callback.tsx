import { ssoLogin } from '@/actions/auth';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import toast from 'react-hot-toast';

const Callback = () => {
  const router = useRouter();
  const { ticket } = router.query;

  useEffect(() => {
    const verifyTicket = async () => {
      if (!ticket) return;

      try {
        await signIn('sso', {
          ticket: ticket,
          redirect: false, 
        })
        
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("loginMethod", "sso");
        
        router.push('/');
      } catch (err) {
        console.error(err);
        toast.error('Gagal login lewat SSO UI');
        router.push('/login');
      }
    };

    verifyTicket();
  }, [ticket]);

  return <p className="text-center mt-10">Memverifikasi login dari SSO UI...</p>;
};

export default Callback;
