import { Reveal } from "@/components/site/Reveal";

export default function ReturnPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Reveal variant="up">
        <h1 className="text-xl font-bold text-ink-900 sm:text-2xl">রিটার্ন নীতিমালা</h1>
      </Reveal>
      <Reveal variant="up" delay={80} className="mt-6 flex flex-col gap-5 text-sm leading-relaxed text-ink-700">
        <p>
          পণ্য হাতে পাওয়ার পর কোনো সমস্যা দেখা দিলে গ্রাহকরা নির্দিষ্ট শর্ত সাপেক্ষে রিটার্নের জন্য
          আবেদন করতে পারবেন।
        </p>
        <div>
          <h2 className="text-base font-semibold text-ink-900">রিটার্নযোগ্য ক্ষেত্র</h2>
          <ul className="mt-2 list-disc space-y-1.5 pl-5">
            <li>পণ্য ক্ষতিগ্রস্ত অবস্থায় পৌঁছালে</li>
            <li>অর্ডারকৃত পণ্যের পরিবর্তে ভিন্ন পণ্য পাঠানো হলে</li>
            <li>পণ্যে উৎপাদনগত ত্রুটি থাকলে</li>
          </ul>
        </div>
        <div>
          <h2 className="text-base font-semibold text-ink-900">প্রক্রিয়া</h2>
          <p className="mt-2">
            রিটার্নের জন্য পণ্য হাতে পাওয়ার নির্দিষ্ট সময়ের মধ্যে অর্ডার নম্বরসহ যোগাযোগ পাতার
            মাধ্যমে জানাতে হবে। যাচাইয়ের পর প্রতিস্থাপন বা প্রযোজ্য ক্ষেত্রে অর্থ ফেরতের ব্যবস্থা
            নেওয়া হবে।
          </p>
        </div>
      </Reveal>
    </div>
  );
}
