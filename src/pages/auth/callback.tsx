import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useSession } from "next-auth/react";

const Callback = () => {
  const router = useRouter();
  const { ticket } = router.query;
  const { data: session, status } = useSession();
  const [isVerifying, setIsVerifying] = useState(true);

  // Handle SSO ticket verification
  useEffect(() => {
    const verifyTicket = async () => {
      if (!ticket) {
        toast.error('No ticket provided');
        router.push('/login');
        return;
      }
      
      try {
        const result = await signIn('sso', {
          ticket: ticket as string,
          redirect: false,
        });

        if (result?.error) {
          throw new Error(result.error);
        }

        localStorage.setItem('loginMethod', 'sso');
        setIsVerifying(false);
      } catch (err) {
        console.error('SSO verification error:', err);
        toast.error('Failed to login with SSO UI. Please try again.');
        router.push('/login');
      }
    };

    if (ticket) {
      verifyTicket();
    }
  }, [ticket, router]);

  // Handle redirect after successful authentication
  useEffect(() => {
    if (!isVerifying && status === 'authenticated' && session) {
      toast.success(`Welcome, ${session.user.username || 'User'}!`, {
        duration: 4500,
        position: 'top-center',
        icon: '👋',
      });
      router.push('/');
    }
  }, [session, status, isVerifying, router]);

  // Show loading message
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <p className="text-center text-lg">Verifying SSO UI login...</p>
      <div className="mt-4 animate-spin w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full"></div>
    </div>
  );
};

export default Callback;