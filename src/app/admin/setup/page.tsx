import { AlertTriangle } from "lucide-react";

export default function AdminSetupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-950 px-4 py-10">
      <div className="w-full max-w-xl rounded-2xl bg-white p-8 shadow-xl">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-50 text-brand-600">
            <AlertTriangle className="h-6 w-6" strokeWidth={1.8} />
          </span>
          <h1 className="text-lg font-bold text-ink-900">Supabase কনফিগারেশন প্রয়োজন</h1>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-ink-700">
          অ্যাডমিন প্যানেলে প্রবেশের জন্য Supabase Authentication ব্যবহার করা হয়। অ্যাডমিন লগইন
          চালু করতে প্রজেক্ট রুটের <code className="rounded bg-cream-100 px-1.5 py-0.5">.env</code>{" "}
          ফাইলে নিচের মানগুলো যুক্ত করুন।
        </p>

        <pre className="scrollbar-dark mt-4 overflow-x-auto rounded-lg bg-navy-950 p-4 text-xs text-cream-100">
{`NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxxxxxxxxxxxxxxxxxxx`}
        </pre>

        <ol className="mt-5 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-ink-700">
          <li>
            <a
              href="https://supabase.com"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-brand-600 underline"
            >
              supabase.com
            </a>{" "}
            এ একটি ফ্রি প্রজেক্ট তৈরি করুন।
          </li>
          <li>Project Settings → API থেকে Project URL এবং anon public key কপি করুন।</li>
          <li>উপরের মানগুলো .env ফাইলে বসিয়ে সার্ভার পুনরায় চালু করুন।</li>
          <li>
            Supabase ড্যাশবোর্ডের Authentication → Users থেকে একটি অ্যাডমিন ইউজার (ইমেইল ও
            পাসওয়ার্ড) তৈরি করুন।
          </li>
          <li>
            <span className="font-medium">/admin/login</span> পেজ থেকে সেই ইমেইল ও পাসওয়ার্ড দিয়ে
            লগইন করুন।
          </li>
        </ol>
      </div>
    </div>
  );
}
