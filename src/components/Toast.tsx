import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { ToastMessage } from '../types';

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full px-4 sm:px-0"
    >
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';
        const isInfo = toast.type === 'info' || toast.type === 'warning';

        return (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto flex items-start justify-between gap-3 rounded-xl border p-3.5 shadow-lg backdrop-blur-md transition-all duration-200 animate-in fade-in slide-in-from-bottom-3 ${
              isSuccess
                ? 'border-emerald-200 bg-white/95 text-slate-800 dark:border-emerald-900/60 dark:bg-slate-900/95 dark:text-slate-100'
                : isError
                ? 'border-rose-200 bg-white/95 text-slate-800 dark:border-rose-900/60 dark:bg-slate-900/95 dark:text-slate-100'
                : 'border-slate-200 bg-white/95 text-slate-800 dark:border-slate-800 dark:bg-slate-900/95 dark:text-slate-100'
            }`}
          >
            <div className="flex items-start gap-2.5">
              {isSuccess && <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />}
              {isError && <AlertCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />}
              {isInfo && <Info className="h-5 w-5 text-teal-500 shrink-0 mt-0.5" />}

              <div className="flex flex-col">
                <span className="text-sm font-medium leading-tight">{toast.message}</span>
                {toast.subtext && (
                  <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {toast.subtext}
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={() => onDismiss(toast.id)}
              aria-label="Dismiss notification"
              className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 p-0.5 rounded-md"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
