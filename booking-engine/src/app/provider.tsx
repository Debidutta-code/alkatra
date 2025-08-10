"use client";

import { useState, useEffect } from "react";
import { NextUIProvider } from "@nextui-org/react";
import ReduxProvider from "@/Redux/ReduxProvider";
import { PersistGate } from "redux-persist/integration/react";
import { persistor } from "@/Redux/store";
import '@/i18n/Index';
// import '@rainbow-me/rainbowkit/styles.css';

// import { WagmiProvider, createConfig, http } from 'wagmi';
// import {
//   getDefaultConfig,
//   RainbowKitProvider
// } from '@rainbow-me/rainbowkit';
// import {
//   mainnet,
//   polygon,
//   optimism,
//   arbitrum,
//   base,
//   polygonAmoy,
//   bsc
// } from 'wagmi/chains';
import {
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";


// const config = getDefaultConfig({
//   appName: 'My RainbowKit App',
//   projectId: 'YOUR_PROJECT_ID', 
//   chains: [mainnet, polygon, optimism, arbitrum, base, polygonAmoy,bsc],
//   ssr: true,
// });

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true); 
  }, []);

  if (!mounted) {
    return null; 
  }

  return (
    // <WagmiProvider config={config}>
    <QueryClientProvider client={queryClient}>
      {/* <RainbowKitProvider> */}
        <NextUIProvider>
          <ReduxProvider>
            <PersistGate loading={null} persistor={persistor}>
              {children}
            </PersistGate>
          </ReduxProvider>
        </NextUIProvider>
      {/* </RainbowKitProvider> */}
    </QueryClientProvider>
  // </WagmiProvider>
  );
}
