'use client';

import { createContext, useContext, useTransition } from 'react';

const NavigationContext = createContext();

function NavigationProvider({ children }) {
  const [isPending, startTransition] = useTransition();

  return (
    <NavigationContext.Provider value={{ isPending, startTransition }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}

export default NavigationProvider;
