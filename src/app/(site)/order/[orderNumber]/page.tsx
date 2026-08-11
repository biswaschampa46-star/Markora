import Link from "next/link";
import { notFound } from "next/navigation";
import { LayoutDashboard, Phone } from "lucide-react";
import { getOrderByNumber } from "@/lib/queries";
import { getUser } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const result = await getOrderByNumber(orderNumber);

  if (!result) {
    notFound();
  }

  const { order } = result;
  const user = await getUser();
  // Only a logged-in customer whose account the order is linked to can track it
  // from the account dashboard. Guest orders (no user) can't be tracked online.
  const canTrack = !!user && order.userId === user.id;
  const canTrackAfterLogin = !user && !!order.userId;

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <div className="rise-item rounded-xl border border-cream-300 bg-white p-6 text-center shadow-sm sm:p-8">
        <span className="success-ring mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-teal-50 text-teal-600 shadow-inner">
          <svg viewBox="0 0 24 24" className="h-9 w-9" fill="none" aria-hidden="true">
            <path
              d="M4.5 12.5l5 5 10-11"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="check-draw"
            />
          </svg>
        </span>
        <h1 className="mt-4 text-xl font-bold text-ink-900 sm:text-2xl">অর্ডার সফল হয়েছে</h1>
        <p className="mt-2 text-sm text-ink-500">
          ধন্যবাদ! আপনার অর্ডারটি গ্রহণ করা হয়েছে এবং শীঘ্রই প্রক্রিয়া শুরু হবে। অর্ডারের
          অগ্রগতি ও ডেলিভারি তথ্য আপনার প্রোফাইলের ড্যাশবোর্ডে দেখতে পাবেন।
        </p>
        <div className="success-pop mt-4 inline-flex items-center gap-2 rounded-lg bg-cream-100 px-4 py-2 text-sm font-semibold text-navy-900">
          অর্ডার নম্বর: {order.orderNumber}
        </div>

        <div className="mt-6 flex flex-col items-center justify-center gap-2 sm:flex-row">
          {canTrack ? (
            <Link
              href="/account"
              className="ripple-host press inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-600 sm:w-auto"
            >
              <LayoutDashboard className="h-4 w-4" />
              আমার ড্যাশবোর্ডে অর্ডার ট্র্যাক করুন
            </Link>
          ) : canTrackAfterLogin ? (
            <Link
              href="/login?next=/account"
              className="ripple-host press inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-600 sm:w-auto"
            >
              <LayoutDashboard className="h-4 w-4" />
              লগইন করে অর্ডার ট্র্যাক করুন
            </Link>
          ) : (
            <Link
              href="/contact"
              className="ripple-host press inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-600 sm:w-auto"
            >
              <Phone className="h-4 w-4" />
              অর্ডার সম্পর্কে যোগাযোগ করুন
            </Link>
          )}
          <Link
            href="/"
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-cream-300 bg-white px-6 py-3 text-sm font-semibold text-ink-700 transition-colors hover:border-brand-400 sm:w-auto"
          >
            কেনাকাটা চালিয়ে যান
          </Link>
        </div>
      </div>
    </div>
  );
}
