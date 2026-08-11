"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import type { Toast, ToastType } from "@/lib/toast-context";

const ICONS: Record<ToastType, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

const ACCENT: Record<ToastType, string> = {
  success: "text-teal-600",
  error: "text-red-500",
  info: "text-navy-600",
};

const BAR: Record<ToastType, string> = {
  success: "bg-teal-500",
  error: "bg-red-500",
  info: "bg-navy-500",
};

export function Toaster({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: number) => void;
}) {
  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4 sm:bottom-6 sm:left-auto sm:right-6 sm:items-end"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: number) => void }) {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (!visible || leaving) return;
    const t = window.setTimeout(() => setLeaving(true), 2500);
    return () => window.clearTimeout(t);
  }, [visible, leaving]);


  useEffect(() => {
    if (!leaving) return;
    const t = window.setTimeout(() => onDismiss(toast.id), 280);
    return () => window.clearTimeout(t);
  }, [leaving, onDismiss, toast.id]);

  const Icon = ICONS[toast.type];

  return (
    <div
      className={`toast-item pointer-events-auto relative flex w-full max-w-sm items-center gap-3 overflow-hidden rounded-xl border border-cream-300 bg-white py-3 pl-4 pr-3 shadow-xl shadow-navy-950/10 ${
        visible ? "is-visible" : ""
      } ${leaving ? "is-leaving" : ""}`}
    >
      <Icon className={`h-5 w-5 shrink-0 ${ACCENT[toast.type]}`} strokeWidth={2} />
      <p className="flex-1 text-sm font-medium text-ink-900">{toast.message}</p>
      <button
        type="button"
        aria-label="বন্ধ করুন"
        onClick={() => setLeaving(true)}
        className="rounded-md p-1 text-ink-300 transition hover:bg-cream-100 hover:text-ink-700"
      >
        <X className="h-4 w-4" />
      </button>
      <span
        className={`toast-bar absolute inset-x-0 bottom-0 h-0.5 ${BAR[toast.type]}`}
        style={{ animationDuration: "2500ms" }}
      />
    </div>
  );
}
