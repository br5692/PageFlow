import React, { createContext, useContext, useState, ReactNode } from 'react';

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

  const showAlert = (type: AlertType, message: string) => {
    setAlert({ type, message });
    
    // Auto hide after 5 seconds
    setTimeout(() => {
      setAlert(null);
    }, 5000);
  };

  const hideAlert = () => {
    setAlert(null);
  };

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