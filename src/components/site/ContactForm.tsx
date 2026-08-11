"use client";

import { useState, type FormEvent } from "react";
import { Loader2, Send } from "lucide-react";
import { useToast } from "@/lib/toast-context";

export function ContactForm() {
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const { push } = useToast();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setStatus("idle");

    const form = e.currentTarget;
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "বার্তা পাঠানো যায়নি।");
        setStatus("error");
        push("error", "বার্তা পাঠানো যায়নি, আবার চেষ্টা করুন।");
      } else {
        setStatus("success");
        form.reset();
        push("success", "বার্তা সফলভাবে পাঠানো হয়েছে!");
      }
    } catch {
      setErrorMsg("সার্ভারে সংযোগ করা যায়নি।");
      setStatus("error");
      push("error", "সার্ভারে সংযোগ করা যায়নি।");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-ink-700">আপনার নাম *</span>
          <input name="name" required className="input" placeholder="পূর্ণ নাম" />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-ink-700">মোবাইল নম্বর *</span>
          <input name="phone" required className="input" placeholder="01XXXXXXXXX" />
        </label>
      </div>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-ink-700">ইমেইল (ঐচ্ছিক)</span>
        <input name="email" type="email" className="input" placeholder="you@example.com" />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-ink-700">বিষয়</span>
        <input name="subject" className="input" placeholder="কী বিষয়ে জানাতে চান" />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-ink-700">বার্তা *</span>
        <textarea
          name="message"
          required
          className="input min-h-[120px] resize-none"
          placeholder="আপনার বার্তা লিখুন"
        />
      </label>

      {status === "success" && (
        <p className="success-pop rounded-lg bg-teal-50 px-4 py-2.5 text-sm font-medium text-teal-700">
          বার্তা সফলভাবে পাঠানো হয়েছে। আমরা শীঘ্রই যোগাযোগ করব।
        </p>
      )}
      {status === "error" && (
        <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600">
          {errorMsg}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        data-ripple
        className="ripple-host press flex w-fit items-center justify-center gap-2 rounded-lg bg-brand-500 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-brand-600 disabled:opacity-70"
      >
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        বার্তা পাঠান
      </button>
    </form>
  );
}
