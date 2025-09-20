"use client";

import { createContext, useContext, useState, ReactNode, useMemo, useEffect } from 'react';

export type Currency = 'USD' | 'INR' | 'EUR' | 'GBP' | 'AED';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

// Helper to get currency from localStorage safely
const getInitialCurrency = (): Currency => {
  if (typeof window === 'undefined') {
    return 'INR'; // Default for server-side rendering
  }
  try {
    const storedCurrency = localStorage.getItem('app-currency');
    // Ensure the stored value is one of the allowed types
    if (storedCurrency === 'USD' || storedCurrency === 'INR' || storedCurrency === 'EUR' || storedCurrency === 'GBP' || storedCurrency === 'AED') {
      return storedCurrency;
    }
  } catch (error) {
    console.error("Failed to read currency from localStorage", error);
  }
  return 'INR'; // Default to INR if nothing is stored or if it's invalid
};

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [currency, setCurrencyState] = useState<Currency>(getInitialCurrency());

  useEffect(() => {
    // When the component mounts, initialize state from localStorage
    setCurrencyState(getInitialCurrency());
  }, []);

  const setCurrency = (newCurrency: Currency) => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('app-currency', newCurrency);
      }
      setCurrencyState(newCurrency);
    } catch (error) {
      console.error("Failed to save currency to localStorage", error);
    }
  };

  const value = useMemo(() => ({ currency, setCurrency }), [currency]);

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
