import { Reveal } from "@/components/site/Reveal";

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Reveal variant="up">
        <h1 className="text-xl font-bold text-ink-900 sm:text-2xl">ব্যবহারের শর্তাবলী</h1>
      </Reveal>
      <Reveal variant="up" delay={80} className="mt-6 flex flex-col gap-5 text-sm leading-relaxed text-ink-700">
        <p>
          Markora ওয়েবসাইট ব্যবহারের মাধ্যমে আপনি নিচের শর্তাবলীর সাথে সম্মত হচ্ছেন। অনুগ্রহ করে
          কেনাকাটা করার আগে এই শর্তাবলী মনোযোগ সহকারে পড়ুন।
        </p>
        <div>
          <h2 className="text-base font-semibold text-ink-900">অর্ডার ও পেমেন্ট</h2>
          <p className="mt-2">
            বর্তমানে ক্যাশ অন ডেলিভারি পদ্ধতিতে অর্ডার গ্রহণ করা হয়। অর্ডার নিশ্চিত হওয়ার পর
            নির্দিষ্ট সময়ের মধ্যে পণ্য পৌঁছে দেওয়ার চেষ্টা করা হয়।
          </p>
        </div>
        <div>
          <h2 className="text-base font-semibold text-ink-900">পণ্যের তথ্য</h2>
          <p className="mt-2">
            প্রতিটি পণ্যের বিবরণ, ছবি ও মূল্য যথাসম্ভব সঠিকভাবে উপস্থাপন করার চেষ্টা করা হয়। তবে
            স্টক পরিবর্তনের কারণে কোনো পণ্য সাময়িকভাবে অনুপলব্ধ হতে পারে।
          </p>
        </div>
        <div>
          <h2 className="text-base font-semibold text-ink-900">দায়বদ্ধতা</h2>
          <p className="mt-2">
            ডেলিভারি সংক্রান্ত কোনো জটিলতা দেখা দিলে গ্রাহক সহায়তা কেন্দ্রের মাধ্যমে যোগাযোগ করা
            যাবে।
          </p>
        </div>
      </Reveal>
    </div>
  );
}
