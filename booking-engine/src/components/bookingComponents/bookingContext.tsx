import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Preference {
  adults: number;
  children: number;
  breakfast: boolean;
  lunch: boolean;
  dinner: boolean;
}

interface BookingContextType {
  preference: Preference;
  price: number;
  setPreference: React.Dispatch<React.SetStateAction<Preference>>;
  setPrice: React.Dispatch<React.SetStateAction<number>>;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const useBookingContext = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBookingContext must be used within a BookingProvider');
  }
  return context;
};

export const BookingProvider = ({ children }: { children: ReactNode }) => {
  const [preference, setPreference] = useState<Preference>({
    adults: 1,
    children: 0,
    breakfast: false,
    lunch: false,
    dinner: false,
  });
  const [price, setPrice] = useState(0);

  return (
    <BookingContext.Provider value={{ preference, price, setPreference, setPrice }}>
      {children}
    </BookingContext.Provider>
  );
};
