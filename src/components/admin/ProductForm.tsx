"use client";

import { useActionState, useState, type ChangeEvent, type ReactNode } from "react";
import Image from "next/image";
import { ImageOff, Loader2, UploadCloud } from "lucide-react";
import type { ActionResult } from "@/app/admin/(dashboard)/actions";
import { Select } from "@/components/ui/Select";

type Category = { id: number; nameBn: string };

type ProductDefaults = {
  name: string;
  description: string;
  price: string;
  oldPrice: string | null;
  stock: number;
  categoryId: number | null;
  isFeatured: boolean;
  isActive: boolean;
  imageUrl: string;
};

export function ProductForm({
  categories,
  action,
  defaults,
  submitLabel,
}: {
  categories: Category[];
  action: (formData: FormData) => Promise<ActionResult>;
  defaults?: ProductDefaults;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(
    async (_prev, formData) => action(formData),
    undefined,
  );
  const [preview, setPreview] = useState<string | null>(defaults?.imageUrl || null);

  function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  }

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="flex flex-col gap-4 rounded-xl border border-cream-300 bg-white p-5 lg:col-span-2">
          <Field label="পণ্যের নাম *">
            <input
              name="name"
              required
              defaultValue={defaults?.name}
              className="input"
              placeholder="যেমন: স্যামসাং গ্যালাক্সি স্মার্টফোন"
            />
          </Field>

          <Field label="বিবরণ">
            <textarea
              name="description"
              defaultValue={defaults?.description}
              className="input min-h-[120px] resize-none"
              placeholder="পণ্যের বিস্তারিত তথ্য লিখুন"
            />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="মূল্য (৳) *">
              <input
                name="price"
                type="number"
                step="0.01"
                min="0"
                required
                defaultValue={defaults?.price}
                className="input"
                placeholder="১৫০০"
              />
            </Field>
            <Field label="পূর্বের মূল্য (৳) — ঐচ্ছিক">
              <input
                name="oldPrice"
                type="number"
                step="0.01"
                min="0"
                defaultValue={defaults?.oldPrice ?? ""}
                className="input"
                placeholder="১৮০০"
              />
            </Field>
            <Field label="স্টক পরিমাণ *">
              <input
                name="stock"
                type="number"
                min="0"
                required
                defaultValue={defaults?.stock ?? 0}
                className="input"
              />
            </Field>
            <Field label="ক্যাটাগরি">
              <Select
                name="categoryId"
                options={categories.map((c) => ({ value: String(c.id), label: c.nameBn }))}
                defaultValue={defaults?.categoryId != null ? String(defaults.categoryId) : ""}
                placeholder="নির্বাচন করুন"
              />
            </Field>
          </div>

          <div className="flex flex-wrap gap-6 pt-1">
            <label className="flex items-center gap-2 text-sm text-ink-700">
              <input
                type="checkbox"
                name="isFeatured"
                defaultChecked={defaults?.isFeatured}
                className="h-4 w-4 rounded border-cream-300 text-brand-500 focus:ring-brand-500"
              />
              জনপ্রিয় পণ্য হিসেবে দেখান
            </label>
            <label className="flex items-center gap-2 text-sm text-ink-700">
              <input
                type="checkbox"
                name="isActive"
                defaultChecked={defaults?.isActive ?? true}
                className="h-4 w-4 rounded border-cream-300 text-brand-500 focus:ring-brand-500"
              />
              সাইটে প্রদর্শিত হবে (সক্রিয়)
            </label>
          </div>
        </div>

        <div className="flex flex-col gap-4 rounded-xl border border-cream-300 bg-white p-5">
          <p className="text-sm font-semibold text-ink-900">পণ্যের ছবি</p>
          <div className="relative aspect-square overflow-hidden rounded-lg border-2 border-dashed border-cream-300 bg-cream-100">
            {preview ? (
              <Image src={preview} alt="পণ্যের ছবি" fill className="object-cover" />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-ink-300">
                <ImageOff className="h-10 w-10" strokeWidth={1.3} />
                <span className="text-xs">কোনো ছবি নেই</span>
              </div>
            )}
          </div>
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-cream-300 bg-cream-50 px-4 py-2.5 text-sm font-medium text-ink-700 hover:bg-cream-100">
            <UploadCloud className="h-4 w-4" />
            ছবি আপলোড করুন
            <input
              type="file"
              name="image"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
          <p className="text-xs text-ink-500">JPG, PNG অথবা WEBP, সর্বোচ্চ ৫MB</p>
        </div>
      </div>

      {state?.error && (
        <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="flex w-fit items-center justify-center gap-2 rounded-lg bg-brand-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-brand-600 disabled:opacity-70"
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
