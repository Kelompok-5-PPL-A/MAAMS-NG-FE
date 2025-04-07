import { ssoLogin } from '@/actions/auth';
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
        const res = await ssoLogin(ticket as string);
        const { data } = res;

        localStorage.setItem("userData", JSON.stringify(data.user));
        localStorage.setItem("accessToken", data.access_token);
        localStorage.setItem("refreshToken", data.refresh_token);
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("loginMethod", "sso");

        toast.success(`Welcome, ${data.user?.first_name!}!`, {
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
