import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { SessionProvider } from 'next-auth/react';
import { ChakraProvider } from "@chakra-ui/react";
import { Toaster } from "react-hot-toast";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider>
      <Toaster />
      <SessionProvider session={pageProps.session}>
        <Component {...pageProps} />;
      </SessionProvider>
    </ChakraProvider>
  )
}
