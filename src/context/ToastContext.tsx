import React, { createContext, useContext, useRef } from 'react';
import { Toast } from 'primereact/toast';

interface ToastContextType {
  showToast: (options: {
    severity: 'success' | 'info' | 'warn' | 'error' | 'secondary' | 'contrast';
    summary: string;
    detail: string;
    life?: number;
  }) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const toastRef = useRef<Toast>(null);

  const showToast = (options: {
    severity: 'success' | 'info' | 'warn' | 'error' | 'secondary' | 'contrast';
    summary: string;
    detail: string;
    life?: number;
  }) => {
    toastRef.current?.show(options);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      <Toast ref={toastRef} position="top-right" />
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
