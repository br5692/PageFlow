import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

type AlertType = 'success' | 'error' | 'info' | 'warning';

interface Alert {
  type: AlertType;
  message: string;
}

interface AlertContextType {
  alert: Alert | null;
  showAlert: (type: AlertType, message: string) => void;
  hideAlert: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [alert, setAlert] = useState<Alert | null>(null);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  // Use useCallback to prevent unnecessary re-renders
  const showAlert = useCallback((type: AlertType, message: string) => {
    // Clear any existing timeout to prevent race conditions
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }

    // Update the alert state immediately
    setAlert({ type, message });
    
    // Set a new timeout for auto-hiding
    const id = setTimeout(() => {
      setAlert(null);
    }, 5000);
    
    setTimeoutId(id);
  }, [timeoutId]);

  const hideAlert = useCallback(() => {
    // Clear any existing timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    
    setAlert(null);
  }, [timeoutId]);

  // Create the context value object
  const value = {
    alert,
    showAlert,
    hideAlert,
  };

  return <AlertContext.Provider value={value}>{children}</AlertContext.Provider>;
};

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};