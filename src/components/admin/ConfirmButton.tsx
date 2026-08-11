"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Check, Loader2, Trash2, X } from "lucide-react";
import { useBodyScrollLock } from "@/lib/use-body-scroll-lock";

type Phase = "idle" | "deleting" | "deleted" | "failed";

const DELETING_CLASSES =
  "btn-danger btn-deleting flex cursor-wait items-center gap-1 whitespace-nowrap rounded-lg border border-red-300 px-2.5 py-1.5 text-xs font-medium text-red-500";
const DELETED_CLASSES =
  "btn-danger btn-deleted flex items-center gap-1 whitespace-nowrap rounded-lg border border-green-300 bg-green-50 px-2.5 py-1.5 text-xs font-medium text-green-700";
const FAILED_CLASSES =
  "btn-danger flex items-center gap-1 whitespace-nowrap rounded-lg border border-red-300 bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-700";

export function ConfirmButton({
  action,
  confirmText,
  children,
  className,
}: {
  action: () => void | Promise<void>;
  confirmText: string;
  children: ReactNode;
  className?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const btnRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const timers = useRef<number[]>([]);

  useBodyScrollLock(open);

  function closeModal() {
    setOpen(false);
    btnRef.current?.focus();
  }

  // Focus the safest (cancel) button when the modal opens, so pressing
  // Enter/Escape behaves predictably instead of deleting by accident.
  useEffect(() => {
    if (open) cancelRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        closeModal();
        return;
      }
      // Keep Tab cycling inside the modal instead of escaping to the page.
      if (e.key === "Tab") {
        const focusables = modalRef.current?.querySelectorAll<HTMLElement>(
          "button:not([disabled])",
        );
        if (!focusables || focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement;
        if (e.shiftKey && active === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Clean up any pending animation timers if the row unmounts early.
  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((t) => window.clearTimeout(t));
  }, []);

  async function handleDelete() {
    setOpen(false);
    setPhase("deleting");
    const row = btnRef.current?.closest("[data-row]") ?? null;
    row?.classList.add("row-deleting");

    try {
      await action();
    } catch {
      // Something went wrong — show a brief failure state, then go back to
      // normal so the admin can retry.
      setPhase("failed");
      row?.classList.remove("row-deleting");
      timers.current.push(
        window.setTimeout(() => setPhase("idle"), 1600),
      );
      return;
    }

    // Deleted! Show the success state, then fade the row out, then let the
    // server list refresh (the action no longer revalidates this route, so
    // the animation can finish before the row is removed).
    setPhase("deleted");
    row?.classList.remove("row-deleting");
    timers.current.push(
      window.setTimeout(() => {
        row?.classList.add("row-exit");
        timers.current.push(
          window.setTimeout(() => {
            if (row) (row as HTMLElement).style.display = "none";
            router.refresh();
          }, 600),
        );
      }, 1000),
    );
  }

  const buttonClasses =
    phase === "deleting"
      ? DELETING_CLASSES
      : phase === "deleted"
        ? DELETED_CLASSES
        : phase === "failed"
          ? FAILED_CLASSES
          : [className, "btn-danger", "whitespace-nowrap"].filter(Boolean).join(" ");

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen(true)}
        disabled={phase !== "idle"}
        className={buttonClasses}
      >
        {phase === "idle" ? (
          children
        ) : phase === "deleting" ? (
          <>
            <Loader2 className="spin-soft h-3.5 w-3.5" />
            মুছে ফেলা হচ্ছে…
          </>
        ) : phase === "deleted" ? (
          <>
            <Check className="success-pop h-3.5 w-3.5" strokeWidth={3} />
            মুছে ফেলা হয়েছে
          </>
        ) : (
          <>
            <AlertTriangle className="h-3.5 w-3.5" />
            মুছে ফেলা যায়নি
          </>
        )}
      </button>

      {open && (
        <div
          className="modal-backdrop fixed inset-0 z-[90] flex items-center justify-center bg-navy-950/70 p-4 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-label="মুছে ফেলার নিশ্চিতকরণ"
            className="modal-panel w-full max-w-md rounded-2xl border border-white/10 bg-[#262a2f] p-6 shadow-2xl shadow-black/50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] font-medium uppercase tracking-wider text-white/40">
                Markora অ্যাডমিন
              </p>
              <button
                type="button"
                aria-label="বন্ধ করুন"
                onClick={closeModal}
                className="rounded-md p-1 text-white/50 transition hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-400/15 text-amber-300 ring-1 ring-amber-300/30">
                <AlertTriangle className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-base font-bold text-white">মুছে ফেলবেন?</h3>
                <p className="mt-1 text-sm leading-relaxed text-white/70">{confirmText}</p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                ref={cancelRef}
                type="button"
                onClick={closeModal}
                className="rounded-lg bg-[#0e4c45] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0a3b36] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-300"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="flex items-center gap-1.5 rounded-lg bg-[#b8f0e6] px-4 py-2.5 text-sm font-bold text-[#0b3b36] transition hover:bg-[#a0e8da] active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-300"
              >
                <Trash2 className="h-4 w-4" />
                মুছুন
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
