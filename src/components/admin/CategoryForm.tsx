"use client";

import { useActionState, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import type { ActionResult } from "@/app/admin/(dashboard)/actions";
import { CATEGORY_ICON_OPTIONS } from "@/lib/icon-map";
import { Select } from "@/components/ui/Select";

type CategoryDefaults = {
  nameBn: string;
  slug: string | null;
  icon: string;
  sortOrder: number;
};

export function CategoryForm({
  action,
  defaults,
  submitLabel,
}: {
  action: (formData: FormData) => Promise<ActionResult>;
  defaults?: CategoryDefaults;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(
    async (_prev, formData) => action(formData),
    undefined,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="ক্যাটাগরির নাম *">
          <input
            name="nameBn"
            required
            defaultValue={defaults?.nameBn}
            className="input"
            placeholder="যেমন: ইলেকট্রনিক্স"
          />
        </Field>
        <Field label="স্লাগ (ঐচ্ছিক)">
          <input
            name="slug"
            defaultValue={defaults?.slug ?? ""}
            className="input"
            placeholder="খালি রাখলে স্বয়ংক্রিয় তৈরি হবে"
          />
        </Field>
        <Field label="আইকন">
          <Select
            name="icon"
            options={CATEGORY_ICON_OPTIONS}
            defaultValue={defaults?.icon ?? "layout-grid"}
          />
        </Field>
        <Field label="সাজানোর ক্রম">
          <input
            name="sortOrder"
            type="number"
            min="0"
            defaultValue={defaults?.sortOrder ?? 0}
            className="input"
          />
        </Field>
      </div>

      {state?.error && (
        <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="flex w-fit items-center justify-center gap-2 rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-brand-600 disabled:opacity-70"
      >
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        {submitLabel}
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium text-ink-700">{label}</span>
      {children}
    </label>
  );
}
