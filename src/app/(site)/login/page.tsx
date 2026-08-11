"use client";

import { Suspense, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, LockKeyhole, UserRound, UserRoundPlus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { sanitizeNextPath } from "@/lib/safe-next";

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z"
      />
    </svg>
  );
}

function translateAuthError(message: string): string {
  const msg = message.toLowerCase();
  if (msg.includes("invalid login credentials")) {
    return "ইমেইল অথবা পাসওয়ার্ড সঠিক নয়।";
  }
  if (msg.includes("email not confirmed")) {
    return "ইমেইল এখনো কনফার্ম করা হয়নি। ইনবক্সে পাঠানো লিংকে ক্লিক করুন।";
  }
  if (msg.includes("already registered")) {
    return "এই ইমেইলে আগেই একটি অ্যাকাউন্ট আছে — লগইন করুন।";
  }
  if (msg.includes("at least 6 characters")) {
    return "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।";
  }
  if (msg.includes("invalid email")) {
    return "সঠিক ইমেইল ঠিকানা দিন।";
  }
  return message;
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const next = sanitizeNextPath(searchParams.get("next"));

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(() =>
    searchParams.get("error") === "auth" ? "লগইন সম্পন্ন হয়নি। আবার চেষ্টা করুন।" : "",
  );
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // ইতিমধ্যে লগইন করা থাকলে সরাসরি ফিরে যাই
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const client = createClient();
      if (!client) return;
      const { data } = await client.auth.getUser();
      if (!cancelled && data.user) {
        router.replace(next);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router, next]);

  async function handleGoogle() {
    setError("");
    setInfo("");
    const client = createClient();
    if (!client) {
      setError("Supabase কনফিগার করা নেই।");
      return;
    }
    setGoogleLoading(true);
    const { error: oauthError } = await client.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    if (oauthError) {
      setGoogleLoading(false);
      setError(translateAuthError(oauthError.message));
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setInfo("");
    const client = createClient();
    if (!client) {
      setError("Supabase কনফিগার করা নেই।");
      return;
    }
    setLoading(true);

    if (mode === "signup") {
      const { data, error: signUpError } = await client.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name.trim() || undefined },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });
      if (signUpError) {
        setError(translateAuthError(signUpError.message));
      } else if (data.session) {
        router.push(next);
        router.refresh();
      } else {
        setInfo("নিবন্ধন সফল হয়েছে! ভেরিফিকেশনের জন্য ইমেইলে পাঠানো লিংকে ক্লিক করুন।");
      }
    } else {
      const { error: signInError } = await client.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) {
        setError(translateAuthError(signInError.message));
      } else {
        router.push(next);
        router.refresh();
      }
    }
    setLoading(false);
  }

  const isSignup = mode === "signup";

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute -left-28 top-8 h-72 w-72 rounded-full bg-brand-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-28 bottom-8 h-72 w-72 rounded-full bg-teal-500/20 blur-3xl" />

      <div className="relative mx-auto flex w-full max-w-md flex-col items-center px-4 py-10 sm:py-16">
        <div className="w-full rounded-3xl border border-cream-200 bg-white p-6 shadow-xl shadow-navy-950/5 sm:p-8">
          <div className="flex flex-col items-center text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-navy-900 text-white shadow-lg shadow-navy-950/20">
              {isSignup ? (
                <UserRoundPlus className="h-6 w-6" strokeWidth={1.8} />
              ) : (
                <UserRound className="h-6 w-6" strokeWidth={1.8} />
              )}
            </span>
            <h1 className="mt-4 text-xl font-bold text-ink-900">
              {isSignup ? "অ্যাকাউন্ট তৈরি করুন" : "লগইন করুন"}
            </h1>
            <p className="mt-1 text-sm text-ink-500">
              {isSignup ? "Markora এ যোগ দিন, সহজে অর্ডার করুন" : "আপনার অ্যাকাউন্টে ফিরে আসুন"}
            </p>
          </div>

          <button
            type="button"
            onClick={handleGoogle}
            disabled={googleLoading || loading}
            className="mt-7 flex w-full items-center justify-center gap-2.5 rounded-xl border border-cream-300 bg-white px-4 py-2.5 text-sm font-semibold text-ink-900 transition hover:bg-cream-50 active:scale-[0.98] disabled:opacity-70"
          >
            {googleLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-navy-600" />
            ) : (
              <GoogleIcon className="h-5 w-5" />
            )}
            {googleLoading
              ? "অপেক্ষা করুন…"
              : isSignup
                ? "Google দিয়ে সাইন আপ করুন"
                : "Google দিয়ে লগইন করুন"}
          </button>

          <div className="my-6 flex items-center gap-3 text-xs font-medium uppercase tracking-wide text-ink-300">
            <span className="h-px flex-1 bg-cream-200" />
            অথবা
            <span className="h-px flex-1 bg-cream-200" />
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {isSignup && (
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium text-ink-700">আপনার নাম</span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input"
                  placeholder="যেমন: রহিম উদ্দিন"
                  autoComplete="name"
                />
              </label>
            )}
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-ink-700">ইমেইল</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="you@example.com"
                autoComplete="email"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-ink-700">পাসওয়ার্ড</span>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="••••••••"
                autoComplete={isSignup ? "new-password" : "current-password"}
              />
            </label>

            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium leading-relaxed text-red-600">
                {error}
              </p>
            )}
            {info && (
              <p className="rounded-lg bg-teal-50 px-3 py-2 text-xs font-medium leading-relaxed text-teal-700">
                {info}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="mt-1 flex items-center justify-center gap-2 rounded-xl bg-brand-500 py-2.5 text-sm font-bold text-white shadow-lg shadow-brand-500/25 transition hover:bg-brand-600 active:scale-[0.98] disabled:opacity-70"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isSignup ? (
                <UserRoundPlus className="h-4 w-4" />
              ) : (
                <LockKeyhole className="h-4 w-4" />
              )}
              {isSignup ? "অ্যাকাউন্ট তৈরি করুন" : "লগইন করুন"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-500">
            {isSignup ? (
              <>
                আগে থেকেই অ্যাকাউন্ট আছে?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("signin");
                    setError("");
                    setInfo("");
                  }}
                  className="font-semibold text-brand-600 transition hover:text-brand-700"
                >
                  লগইন করুন
                </button>
              </>
            ) : (
              <>
                নতুন এখানে?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("signup");
                    setError("");
                    setInfo("");
                  }}
                  className="font-semibold text-brand-600 transition hover:text-brand-700"
                >
                  অ্যাকাউন্ট তৈরি করুন
                </button>
              </>
            )}
          </p>
        </div>

        <p className="mt-6 max-w-sm text-center text-xs leading-relaxed text-ink-500">
          লগইন করার মাধ্যমে আপনি আমাদের{" "}
          <Link href="/terms" className="u-line font-medium text-teal-700 hover:text-teal-600">
            শর্তাবলী
          </Link>{" "}
          এবং{" "}
          <Link href="/privacy" className="u-line font-medium text-teal-700 hover:text-teal-600">
            প্রাইভেসি পলিসি
          </Link>{" "}
          মেনে নিচ্ছেন।
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}
