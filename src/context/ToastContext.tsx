'use client';
import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { X, CheckCircle2, Info, AlertTriangle, AlertCircle } from 'lucide-react';

type Severity = 'success' | 'info' | 'warn' | 'error' | 'secondary' | 'contrast';

interface ToastMessage {
  id: number;
  severity: Severity;
  summary: string;
  detail: string;
  life: number;
}

interface ToastContextType {
  showToast: (options: {
    severity: Severity;
    summary: string;
    detail: string;
    life?: number;
  }) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const severityStyles: Record<Severity, { bg: string; border: string; icon: React.ReactNode }> = {
  success: { bg: 'bg-emerald-100 dark:bg-emerald-900', border: 'border-emerald-400', icon: <CheckCircle2 size={14} className="text-emerald-600" /> },
  info: { bg: 'bg-blue-100 dark:bg-blue-900', border: 'border-blue-400', icon: <Info size={14} className="text-blue-600" /> },
  warn: { bg: 'bg-amber-100 dark:bg-amber-900', border: 'border-amber-400', icon: <AlertTriangle size={14} className="text-amber-600" /> },
  error: { bg: 'bg-red-100 dark:bg-red-900', border: 'border-red-400', icon: <AlertCircle size={14} className="text-red-600" /> },
  secondary: { bg: 'bg-[var(--surface)]', border: 'border-[var(--border)]', icon: <Info size={14} className="text-[var(--text-muted)]" /> },
  contrast: { bg: 'bg-slate-800', border: 'border-slate-600', icon: <Info size={14} className="text-white" /> },
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const idRef = useRef(0);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((options: { severity: Severity; summary: string; detail: string; life?: number }) => {
    const id = ++idRef.current;
    const life = options.life ?? 3000;
    setToasts((prev) => [...prev, { ...options, id, life }]);
    setTimeout(() => removeToast(id), life);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast container */}
      <div className="fixed top-2 left-2 right-2 sm:left-auto sm:right-4 sm:top-4 z-[9999] flex flex-col gap-1.5 sm:max-w-xs w-auto pointer-events-none" data-region="toast-container">
        {toasts.map((toast) => {
          const style = severityStyles[toast.severity];
          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-2 p-2 sm:p-2.5 rounded-xl border-2 ${style.border} ${style.bg} shadow-[2px_2px_0_var(--border)] animate-slide-up`}
              style={{ opacity: 1 }}
            >
              <div className="shrink-0 mt-0.5">{style.icon}</div>
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-bold ${toast.severity === 'contrast' ? 'text-white' : 'text-[var(--text)]'}`}>{toast.summary}</p>
                <p className={`text-[10px] mt-0.5 leading-tight ${toast.severity === 'contrast' ? 'text-gray-300' : 'text-[var(--text-muted)]'}`}>{toast.detail}</p>
              </div>
              <button onClick={() => removeToast(toast.id)} className="shrink-0 p-0.5 hover:bg-black/5 rounded">
                <X size={12} className={toast.severity === 'contrast' ? 'text-gray-300' : 'text-[var(--text-muted)]'} />
              </button>
            </div>
          );
        })}
      </div>
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
