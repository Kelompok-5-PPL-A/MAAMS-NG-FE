import { ssoLogin } from '@/actions/auth';
import { getSession, signIn } from 'next-auth/react';
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

        const newSession = await getSession();
        
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("loginMethod", "sso");
        localStorage.setItem("userData", JSON.stringify(newSession?.user));
        localStorage.setItem("accessToken", newSession?.access_token!);
        localStorage.setItem("refreshToken", newSession?.refresh_token!);

        toast.success(`Welcome, ${newSession?.user.first_name!}!`, {
          duration: 4500,
          position: 'top-center',
          icon: '👋',
        });
        
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
