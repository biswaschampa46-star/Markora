"use client";

import { type FormEvent, type ReactNode } from "react";

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
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    if (!window.confirm(confirmText)) {
      e.preventDefault();
    }
  }

  return (
    <form action={action} onSubmit={handleSubmit}>
      <button type="submit" className={className}>
        {children}
      </button>
    </form>
  );
}
