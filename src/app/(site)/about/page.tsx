import { Banknote, PackageCheck, ShieldCheck, Truck } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Reveal variant="up">
        <h1 className="text-xl font-bold text-ink-900 sm:text-2xl">Markora সম্পর্কে</h1>
      </Reveal>
      <Reveal variant="up" delay={80}>
        <p className="mt-4 text-sm leading-relaxed text-ink-700 sm:text-base">
          Markora একটি বাংলাদেশ কেন্দ্রিক অনলাইন মার্কেটপ্লেস যা ক্রেতাদের জন্য সহজ, নিরাপদ এবং
          আরামদায়ক কেনাকাটার অভিজ্ঞতা তৈরি করতে চায়। আমাদের লক্ষ্য হলো একটি নির্ভরযোগ্য প্ল্যাটফর্ম
          তৈরি করা, যেখানে ক্রেতারা প্রয়োজনীয় পণ্য সহজেই খুঁজে পাবেন এবং বিক্রেতারা তাদের পণ্য
          সহজভাবে পরিচালনা করতে পারবেন।
        </p>
      </Reveal>
      <Reveal variant="up" delay={140}>
        <p className="mt-4 text-sm leading-relaxed text-ink-700 sm:text-base">
          একটি সমন্বিত অ্যাডমিন প্যানেলের মাধ্যমে পণ্যের তথ্য, মূল্য এবং ছবি পরিচালনা করা হয়, এবং
          প্রতিটি অর্ডারের ডেলিভারি তথ্য সহজেই ট্র্যাক করা যায়।
        </p>
      </Reveal>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Reveal variant="up" delay={0}>
          <ValueCard
            icon={Truck}
            title="সহজ ডেলিভারি ব্যবস্থাপনা"
            desc="প্রতিটি অর্ডারের ডেলিভারি তথ্য সুশৃঙ্খলভাবে সংরক্ষণ ও পরিচালনা করা হয়।"
          />
        </Reveal>
        <Reveal variant="up" delay={80}>
          <ValueCard
            icon={ShieldCheck}
            title="নিরাপদ প্ল্যাটফর্ম"
            desc="গ্রাহকের তথ্য সুরক্ষিত রাখতে আধুনিক প্রযুক্তি ব্যবহার করা হয়।"
          />
        </Reveal>
        <Reveal variant="up" delay={160}>
          <ValueCard
            icon={Banknote}
            title="স্বচ্ছ মূল্য নির্ধারণ"
            desc="প্রতিটি পণ্যের মূল্য স্পষ্টভাবে উল্লেখ করা থাকে, কোনো লুকানো খরচ নেই।"
          />
        </Reveal>
        <Reveal variant="up" delay={240}>
          <ValueCard
            icon={PackageCheck}
            title="মানসম্মত পণ্য"
            desc="বিক্রয়ের আগে পণ্যের তথ্য যাচাই করে তবেই তালিকাভুক্ত করা হয়।"
          />
        </Reveal>
      </div>
    </div>
  );
}

function ValueCard({
  icon: Icon,
  title,
  desc,
}: {
  icon: typeof Truck;
  title: string;
  desc: string;
}) {
  return (
    <div className="group flex gap-3 rounded-xl border border-cream-300 bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-brand-400/50 hover:shadow-lg hover:shadow-brand-500/10">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-600 transition-all duration-300 group-hover:scale-110 group-hover:bg-brand-50 group-hover:text-brand-600">
        <Icon
          className="h-5 w-5 transition-transform duration-300 group-hover:-translate-y-0.5"
          strokeWidth={1.7}
        />
      </span>
      <div>
        <p className="text-sm font-semibold text-ink-900">{title}</p>
        <p className="mt-1 text-xs leading-relaxed text-ink-500">{desc}</p>
      </div>
    </div>
  );
}
