"use client";

import React, { useEffect, useState, useCallback } from "react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

type ToastListener = (toasts: ToastItem[]) => void;

class ToastManager {
  private toasts: ToastItem[] = [];
  private listeners: Set<ToastListener> = new Set();

  private notify() {
    this.listeners.forEach((listener) => listener([...this.toasts]));
  }

  subscribe(listener: ToastListener) {
    this.listeners.add(listener);
    listener([...this.toasts]);
    return () => {
      this.listeners.delete(listener);
    };
  }

  show(toast: Omit<ToastItem, "id">): string {
    const id = Math.random().toString(36).substring(2, 9);
    const item: ToastItem = {
      ...toast,
      id,
      duration: toast.duration ?? 4000,
    };
    this.toasts = [...this.toasts, item];
    this.notify();

    if (item.duration && item.duration > 0) {
      setTimeout(() => {
        this.dismiss(id);
      }, item.duration);
    }
    return id;
  }

  dismiss(id: string) {
    this.toasts = this.toasts.filter((t) => t.id !== id);
    this.notify();
  }

  clear() {
    this.toasts = [];
    this.notify();
  }
}

export const toastManager = new ToastManager();

export const toast = {
  show: (message: string, type: ToastType = "info", options?: { title?: string; duration?: number }) => {
    return toastManager.show({
      message,
      type,
      title: options?.title,
      duration: options?.duration,
    });
  },
  success: (message: string, title?: string, duration?: number) => {
    return toastManager.show({ message, type: "success", title, duration });
  },
  error: (message: string, title?: string, duration?: number) => {
    return toastManager.show({ message, type: "error", title, duration });
  },
  info: (message: string, title?: string, duration?: number) => {
    return toastManager.show({ message, type: "info", title, duration });
  },
  warning: (message: string, title?: string, duration?: number) => {
    return toastManager.show({ message, type: "warning", title, duration });
  },
  dismiss: (id: string) => toastManager.dismiss(id),
  clear: () => toastManager.clear(),
};

function ToastIcon({ type }: { type: ToastType }) {
  if (type === "success") {
    return (
      <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-[#25D366] border border-emerald-500/30 flex items-center justify-center shrink-0">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
        </svg>
      </div>
    );
  }
  if (type === "error") {
    return (
      <div className="w-8 h-8 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center shrink-0">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 8.25h.008v.008H12v-.008Z" />
        </svg>
      </div>
    );
  }
  if (type === "warning") {
    return (
      <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center shrink-0">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
        </svg>
      </div>
    );
  }
  return (
    <div className="w-8 h-8 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 flex items-center justify-center shrink-0">
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
      </svg>
    </div>
  );
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    return toastManager.subscribe((newToasts) => {
      setToasts(newToasts);
    });
  }, []);

  if (toasts.length === 0) return null;

  return (
    <aside aria-label="Notifications" className="fixed top-5 right-5 z-[99999] flex flex-col gap-3 max-w-md w-[calc(100vw-2.5rem)] pointer-events-none">
      {toasts.map((item) => (
        <div
          key={item.id}
          className={`pointer-events-auto flex items-start gap-3.5 p-4 rounded-2xl shadow-2xl backdrop-blur-xl border transition-all duration-300 animate-in fade-in slide-in-from-top-4 ${
            item.type === "error"
              ? "bg-[#1f0a0d]/90 border-red-800/60 shadow-red-950/40 text-red-100"
              : item.type === "warning"
              ? "bg-[#241a05]/90 border-amber-700/60 shadow-amber-950/40 text-amber-100"
              : item.type === "success"
              ? "bg-[#0b2416]/90 border-emerald-700/60 shadow-emerald-950/40 text-emerald-100"
              : "bg-[#0c1f2e]/90 border-sky-800/60 shadow-sky-950/40 text-sky-100"
          }`}
          style={{
            boxShadow: "0 10px 30px -5px rgba(0, 0, 0, 0.5), 0 0 15px 0 rgba(212, 175, 55, 0.08)",
          }}
          role="status"
          aria-live="polite"
        >
          <ToastIcon type={item.type} />
          
          <div className="flex-1 min-w-0 pt-0.5">
            {item.title && (
              <h4 className="text-sm font-semibold tracking-wide text-[#F3E5AB] mb-0.5">
                {item.title}
              </h4>
            )}
            <p className="text-xs sm:text-sm font-medium leading-relaxed break-words text-white/90">
              {item.message}
            </p>
          </div>

          <button
            onClick={() => toast.dismiss(item.id)}
            className="text-white/50 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10 shrink-0"
            aria-label="Close notification"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </aside>
  );
}
