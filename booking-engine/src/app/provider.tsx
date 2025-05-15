"use client";

import { useState, useEffect } from "react";
import { NextUIProvider } from "@nextui-org/react";
import ReduxProvider from "@/Redux/ReduxProvider";
import { PersistGate } from "redux-persist/integration/react";
import { persistor } from "@/Redux/store";

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true); // Ensures rendering happens only after hydration
  }, []);

  if (!mounted) {
    return null; // Prevents hydration mismatches by avoiding SSR rendering
  }

  return (
    <NextUIProvider>
      <ReduxProvider>
        <PersistGate loading={null} persistor={persistor}>
          {children}
        </PersistGate>
      </ReduxProvider>
    </NextUIProvider>
  );
}
