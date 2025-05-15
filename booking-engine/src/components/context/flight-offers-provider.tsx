
"use client";

import {
  FlightOffersStore,
  useFlightOffersStore as flightOffersStore,
  initFlightOffersStore,
} from "@/store/index";
import { type ReactNode, createContext, useRef, useContext } from "react";
import { useStore } from "zustand";

export type FlightOffersStoreApi = ReturnType<typeof useFlightOffersStore>;

export const FlightOffersStoreContext = createContext<
  FlightOffersStoreApi | undefined
>(undefined);

export interface FlightOffersStoreProviderProps {
  children: ReactNode;
}

export const FlightOffersStoreProvider = ({
  children,
}: FlightOffersStoreProviderProps) => {
  const storeRef = useRef<FlightOffersStoreApi>();
  if (!storeRef.current) {
    storeRef.current = flightOffersStore(initFlightOffersStore());
  }

  return (
    <FlightOffersStoreContext.Provider value={storeRef.current}>
      {children}
    </FlightOffersStoreContext.Provider>
  );
};

export const useFlightOffersStore = <T,>(
  selector: (store: FlightOffersStore) => T
): T => {
  const flightOffersStoreContext = useContext(FlightOffersStoreContext);

  if (!flightOffersStoreContext) {
    throw new Error(
      `flightOffersStore must be used within FlightOffersStoreProvider`
    );
  }

  return useStore(flightOffersStoreContext as any, selector as any);
};
