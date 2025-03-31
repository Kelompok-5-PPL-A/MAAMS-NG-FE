import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { SessionProvider } from 'next-auth/react';
import { ChakraProvider } from "@chakra-ui/react";
import { Toaster } from "react-hot-toast";
import { Suspense } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';

const Login = dynamic(() => import('./login'), {
  ssr: false,
});

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  return (
    <ChakraProvider>
      <Toaster />
      <SessionProvider session={pageProps.session} basePath={process.env.NEXT_PUBLIC_NEXTAUTH_URL + "/api/auth/"}>
        <Suspense fallback={<div>Loading...</div>}>
        {router.pathname === '/login' ? <Login /> : <Component {...pageProps} />}
      </Suspense>
      </SessionProvider>
    </ChakraProvider>
  )
}
