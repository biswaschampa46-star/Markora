"use client";

import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, ImageOff, Loader2, LockKeyhole, UserRoundPlus, Wallet } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { formatTaka } from "@/lib/format";
import { createClient } from "@/lib/supabase/client";
import { getUserDisplayName } from "@/lib/user-display";
import { EmptyState } from "@/components/site/EmptyState";
import { AnimatedNumber } from "@/components/site/AnimatedNumber";

export default function CheckoutPage() {
  const { items, totalPrice, clearCart, isHydrated } = useCart();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [authChecking, setAuthChecking] = useState(true);
  const [isAuthed, setIsAuthed] = useState(false);
  const storePhone = process.env.NEXT_PUBLIC_STORE_PHONE || "01XXXXXXXXX";
  const [form, setForm] = useState({
    customerName: "",
    phone: "",
    altPhone: "",
    address: "",
    city: "",
    area: "",
    note: "",
    paymentMethod: "cash_on_delivery",
    transactionId: "",
  });

  // Every order requires a logged-in account - check the session on mount.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const client = createClient();
      if (!client) {
        if (!cancelled) setAuthChecking(false);
        return;
      }
      const { data } = await client.auth.getUser();
      if (cancelled) return;
      if (data.user) {
        setIsAuthed(true);
        setForm((f) => ({ ...f, customerName: getUserDisplayName(data.user) }));
      }
      setAuthChecking(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const isDhaka = useMemo(
    () => form.city.trim().toLowerCase().includes("ঢাকা") || form.city.trim().toLowerCase().includes("dhaka"),
    [form.city],
  );
  const deliveryFee = form.city ? (isDhaka ? 70 : 130) : 0;
  const total = totalPrice + deliveryFee;

  function updateField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!form.customerName || !form.phone || !form.address || !form.city) {
      setError("অনুগ্রহ করে নাম, ফোন নম্বর, ঠিকানা এবং শহর পূরণ করুন।");
      return;
    }

    if (form.paymentMethod !== "cash_on_delivery" && !form.transactionId.trim()) {
      setError("বিকাশ পেমেন্টের জন্য ট্রানজেকশন আইডি (TrxID) দিতে হবে।");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          transactionId:
            form.paymentMethod === "cash_on_delivery" ? "" : form.transactionId.trim(),
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "অর্ডার সম্পন্ন করা যায়নি।");
        setSubmitting(false);
        return;
      }
      clearCart();
      router.push(`/order/${data.orderNumber}`);
    } catch {
      setError("সার্ভারে সংযোগ করা যায়নি। আবার চেষ্টা করুন।");
      setSubmitting(false);
    }
  }

  if (!isHydrated || authChecking) {
    return <div className="mx-auto max-w-5xl px-4 py-10" />;
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <EmptyState
          title="কার্ট খালি"
          description="চেকআউট করার আগে কার্টে পণ্য যোগ করুন।"
        />
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600"
          >
            কেনাকাটা করুন
          </Link>
        </div>
      </div>
    );
  }

  // অর্ডার করতে অবশ্যই লগইন করতে হবে
  if (!isAuthed) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <div className="rise-item rounded-2xl border border-cream-200 bg-white p-6 text-center shadow-xl shadow-navy-950/5 sm:p-10">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-500">
            <LockKeyhole className="h-8 w-8" strokeWidth={1.6} />
          </span>
          <h1 className="mt-5 text-xl font-bold text-ink-900">অর্ডার করতে লগইন করুন</h1>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-500">
            অর্ডার সম্পন্ন করতে আপনার অ্যাকাউন্টে লগইন করতে হবে। নতুন হলে এক মিনিটেই অ্যাকাউন্ট তৈরি
            করে নিন — আপনার কার্টের পণ্যগুলো নিরাপদ থাকবে।
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/login?next=/checkout"
              data-ripple
              className="ripple-host press inline-flex items-center justify-center gap-2 rounded-xl bg-brand-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-brand-500/25 transition hover:bg-brand-600"
            >
              <LockKeyhole className="h-4 w-4" />
              লগইন করুন
            </Link>
            <Link
              href="/login?next=/checkout&mode=signup"
              className="press inline-flex items-center justify-center gap-2 rounded-xl border border-cream-300 bg-white px-6 py-3 text-sm font-bold text-navy-900 transition hover:border-brand-400/50 hover:bg-cream-50"
            >
              <UserRoundPlus className="h-4 w-4" />
              নতুন অ্যাকাউন্ট তৈরি করুন
            </Link>
          </div>
          <p className="mt-6 text-xs text-ink-400">
            কার্টের {items.length} টি পণ্য লগইনের পরও সংরক্ষিত থাকবে।
          </p>
        </div>
      </div>
    );
  }

  const infoDone = !!(form.customerName && form.phone && form.address && form.city);
  const paymentDone =
    form.paymentMethod === "cash_on_delivery" || !!form.transactionId.trim();
  const progress = submitting ? 1 : infoDone && paymentDone ? 0.92 : infoDone ? 0.55 : 0.2;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-xl font-bold text-ink-900">চেকআউট</h1>

      {/* Animated step progress */}
      <div className="mb-6 rounded-xl border border-cream-300 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-2 text-[11px] font-medium text-ink-700 sm:text-xs">
          <span className="flex items-center gap-1.5">
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full transition-all duration-500 ${
                infoDone ? "scale-110 bg-teal-600 text-white" : "bg-cream-200 text-ink-500"
              }`}
            >
              {infoDone ? <Check className="h-3 w-3" strokeWidth={3} /> : "১"}
            </span>
            ডেলিভারি তথ্য
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full transition-all duration-500 ${
                paymentDone ? "scale-110 bg-teal-600 text-white" : "bg-cream-200 text-ink-500"
              }`}
            >
              {paymentDone ? <Check className="h-3 w-3" strokeWidth={3} /> : "২"}
            </span>
            পেমেন্ট
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full transition-all duration-500 ${
                submitting ? "scale-110 bg-brand-500 text-white" : "bg-cream-200 text-ink-500"
              }`}
            >
              {submitting ? (
                <Loader2 className="spin-soft h-3 w-3" />
              ) : (
                "৩"
              )}
            </span>
            নিশ্চিতকরণ
          </span>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-cream-200">
          <div
            className="step-fill is-active h-full rounded-full bg-gradient-to-r from-brand-500 to-teal-500"
            style={{ "--step-progress": progress } as React.CSSProperties}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-4 rounded-xl border border-cream-300 bg-white p-5 lg:col-span-2">
          <h2 className="text-base font-bold text-ink-900">ডেলিভারি তথ্য</h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="পূর্ণ নাম *">
              <input
                required
                value={form.customerName}
                onChange={(e) => updateField("customerName", e.target.value)}
                className="input"
                placeholder="যেমন: রহিম উদ্দিন"
              />
            </Field>
            <Field label="মোবাইল নম্বর *">
              <input
                required
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                className="input"
                placeholder="01XXXXXXXXX"
              />
            </Field>
            <Field label="বিকল্প মোবাইল নম্বর">
              <input
                value={form.altPhone}
                onChange={(e) => updateField("altPhone", e.target.value)}
                className="input"
                placeholder="ঐচ্ছিক"
              />
            </Field>
            <Field label="শহর / জেলা *">
              <input
                required
                value={form.city}
                onChange={(e) => updateField("city", e.target.value)}
                className="input"
                placeholder="যেমন: ঢাকা, চট্টগ্রাম"
              />
            </Field>
            <Field label="এলাকা">
              <input
                value={form.area}
                onChange={(e) => updateField("area", e.target.value)}
                className="input"
                placeholder="যেমন: মিরপুর, আগ্রাবাদ"
              />
            </Field>
          </div>

          <Field label="বিস্তারিত ঠিকানা *">
            <textarea
              required
              value={form.address}
              onChange={(e) => updateField("address", e.target.value)}
              className="input min-h-[80px] resize-none"
              placeholder="বাসা/হোল্ডিং নম্বর, রোড নম্বর, এলাকার নাম"
            />
          </Field>

          <Field label="অর্ডার নোট (ঐচ্ছিক)">
            <textarea
              value={form.note}
              onChange={(e) => updateField("note", e.target.value)}
              className="input min-h-[60px] resize-none"
              placeholder="ডেলিভারি সংক্রান্ত কোনো নির্দেশনা থাকলে লিখুন"
            />
          </Field>

          <div>
            <p className="mb-2 text-sm font-medium text-ink-700">পেমেন্ট পদ্ধতি</p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <label
                className={`press flex flex-1 cursor-pointer items-center gap-2 rounded-lg border-2 px-4 py-3 text-sm font-medium transition-colors ${
                  form.paymentMethod === "cash_on_delivery"
                    ? "border-brand-500 bg-brand-50 text-brand-700 shadow-sm"
                    : "border-cream-300 text-ink-600 hover:border-brand-400/40"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cash_on_delivery"
                  checked={form.paymentMethod === "cash_on_delivery"}
                  onChange={(e) => updateField("paymentMethod", e.target.value)}
                  className="hidden"
                />
                <Wallet className="h-4 w-4" />
                ক্যাশ অন ডেলিভারি
              </label>
              <label
                className={`press flex flex-1 cursor-pointer items-center gap-2 rounded-lg border-2 px-4 py-3 text-sm font-medium transition-colors ${
                  form.paymentMethod === "bkash"
                    ? "border-[#E2136E] bg-[#E2136E]/10 text-[#E2136E] shadow-sm"
                    : "border-cream-300 text-ink-600 hover:border-[#E2136E]/40"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="bkash"
                  checked={form.paymentMethod === "bkash"}
                  onChange={(e) => updateField("paymentMethod", e.target.value)}
                  className="hidden"
                />
                <span
                  className={`flex h-6 items-center rounded-md px-1.5 text-xs font-bold tracking-tight text-white transition ${
                    form.paymentMethod === "bkash" ? "bg-[#E2136E]" : "bg-[#E2136E]/80"
                  }`}
                >
                  bKash
                </span>
                বিকাশ
              </label>
            </div>

            {form.paymentMethod === "bkash" && (
              <div className="mt-3 rounded-lg border border-[#E2136E]/30 bg-[#E2136E]/5 p-4">
                <p className="text-sm text-ink-700">
                  <span className="font-semibold">{storePhone}</span> নম্বরে বিকাশ করুন এবং নিচে
                  ট্রানজেকশন আইডি (TrxID) লিখুন। পেমেন্ট যাচাইয়ের পর অর্ডারটি নিশ্চিত করা হবে।
                </p>
                <Field label="ট্রানজেকশন আইডি (TrxID) *">
                  <input
                    required
                    value={form.transactionId}
                    onChange={(e) => updateField("transactionId", e.target.value)}
                    className="input mt-1"
                    placeholder="যেমন: 9HX7F2KQ1A"
                  />
                </Field>
              </div>
            )}
          </div>

          {error && (
            <p className="success-pop rounded-lg bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600">
              {error}
            </p>
          )}
        </div>

        <div className="h-fit rounded-xl border border-cream-300 bg-white p-5">
          <h2 className="text-base font-bold text-ink-900">অর্ডার সারসংক্ষেপ</h2>
          <div className="mt-3 flex flex-col gap-3">
            {items.map((item) => (
              <div key={item.productId} className="flex items-center gap-2.5">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-cream-100">
                  {item.imageUrl ? (
                    <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-ink-300">
                      <ImageOff className="h-4 w-4" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-xs font-medium text-ink-900">{item.name}</p>
                  <p className="text-xs text-ink-500">
                    {item.quantity} x {formatTaka(item.price)}
                  </p>
                </div>
                <p className="text-xs font-semibold text-ink-900">
                  {formatTaka(item.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-col gap-1.5 border-t border-cream-200 pt-3 text-sm">
            <div className="flex justify-between text-ink-700">
              <span>সাবটোটাল</span>
              <AnimatedNumber value={totalPrice} format={formatTaka} />
            </div>
            <div className="flex justify-between text-ink-700">
              <span>ডেলিভারি চার্জ</span>
              {deliveryFee ? (
                <AnimatedNumber value={deliveryFee} format={formatTaka} />
              ) : (
                <span>শহর লিখুন</span>
              )}
            </div>
            <div className="mt-1 flex justify-between border-t border-cream-200 pt-2 text-base font-bold text-navy-900">
              <span>সর্বমোট</span>
              <AnimatedNumber value={total} format={formatTaka} className="tabular-nums" />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            data-ripple
            className="ripple-host press mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-brand-500 py-3 text-sm font-bold text-white transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            অর্ডার নিশ্চিত করুন
          </button>
        </div>
      </form>
    </div>
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
