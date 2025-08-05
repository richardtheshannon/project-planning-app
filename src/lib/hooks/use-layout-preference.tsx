"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type LayoutPreference = 'left-handed' | 'right-handed';

interface LayoutPreferenceContextType {
  preference: LayoutPreference;
  setPreference: (preference: LayoutPreference) => void;
  isRightHanded: boolean;
}

const LayoutPreferenceContext = createContext<LayoutPreferenceContextType | undefined>(undefined);

export const LayoutPreferenceProvider = ({ children }: { children: ReactNode }) => {
  // Initialize state directly from localStorage on the client side.
  // This function runs only once when the component is first created.
  const [preference, setPreference] = useState<LayoutPreference>(() => {
    if (typeof window !== 'undefined') {
      const storedPreference = localStorage.getItem('layout-preference') as LayoutPreference;
      // Check if the stored value is valid before using it.
      if (storedPreference === 'left-handed' || storedPreference === 'right-handed') {
        return storedPreference;
      }
    }
    // This is the default value for the server or if nothing is stored.
    return 'left-handed';
  });

  // This effect now only handles saving the preference when it changes.
  useEffect(() => {
    localStorage.setItem('layout-preference', preference);
  }, [preference]);

  const isRightHanded = preference === 'right-handed';

  return (
    <LayoutPreferenceContext.Provider value={{ preference, setPreference, isRightHanded }}>
      {children}
    </LayoutPreferenceContext.Provider>
  );
};

export const useLayoutPreference = () => {
  const context = useContext(LayoutPreferenceContext);
  if (context === undefined) {
    throw new Error('useLayoutPreference must be used within a LayoutPreferenceProvider');
  }
  return context;
};
