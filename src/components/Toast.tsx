'use client';

import React from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-24 lg:bottom-8 right-4 left-4 sm:left-auto sm:w-96 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center justify-between p-3.5 rounded-xl shadow-xl border text-sm font-medium animate-slide-down transition-all ${
            toast.type === 'success'
              ? 'bg-emerald-900/95 text-white border-emerald-700 shadow-emerald-900/30'
              : toast.type === 'error'
              ? 'bg-red-900/95 text-white border-red-700 shadow-red-900/30'
              : 'bg-[#0B2545]/95 text-white border-slate-700 shadow-slate-900/30'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-teal-400 shrink-0" />}
            <span className="truncate">{toast.message}</span>
          </div>
          <button
            onClick={() => onDismiss(toast.id)}
            className="p-1 hover:bg-white/10 rounded-lg shrink-0 transition-colors ml-2"
          >
            <X className="w-4 h-4 text-white/70" />
          </button>
        </div>
      ))}
    </div>
  );
};
