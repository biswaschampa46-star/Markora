import { Reveal } from "@/components/site/Reveal";

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Reveal variant="up">
        <h1 className="text-xl font-bold text-ink-900 sm:text-2xl">প্রাইভেসি পলিসি</h1>
      </Reveal>
      <Reveal variant="up" delay={80} className="mt-6 flex flex-col gap-5 text-sm leading-relaxed text-ink-700">
        <p>
          Markora ব্যবহারকারীদের ব্যক্তিগত তথ্যের গোপনীয়তা রক্ষা করাকে গুরুত্বের সাথে বিবেচনা করে।
          অর্ডার সম্পন্ন করার সময় সংগ্রহ করা তথ্য যেমন নাম, ফোন নম্বর ও ঠিকানা শুধুমাত্র ডেলিভারি ও
          গ্রাহক সেবার উদ্দেশ্যে ব্যবহার করা হয়।
        </p>
        <div>
          <h2 className="text-base font-semibold text-ink-900">কী তথ্য সংগ্রহ করা হয়</h2>
          <ul className="mt-2 list-disc space-y-1.5 pl-5">
            <li>নাম ও মোবাইল নম্বর</li>
            <li>ডেলিভারি ঠিকানা</li>
            <li>অর্ডারকৃত পণ্যের তথ্য</li>
          </ul>
        </div>
        <div>
          <h2 className="text-base font-semibold text-ink-900">তথ্যের ব্যবহার</h2>
          <p className="mt-2">
            সংগৃহীত তথ্য অর্ডার প্রক্রিয়াকরণ, ডেলিভারি সমন্বয় এবং গ্রাহক সহায়তার কাজে ব্যবহৃত হয়।
            তৃতীয় কোনো পক্ষের কাছে বিক্রয় বা বিপণনের উদ্দেশ্যে তথ্য হস্তান্তর করা হয় না।
          </p>
        </div>
        <div>
          <h2 className="text-base font-semibold text-ink-900">তথ্য সুরক্ষা</h2>
          <p className="mt-2">
            গ্রাহকের তথ্য সুরক্ষিত সার্ভারে সংরক্ষণ করা হয় এবং অ্যাডমিন প্যানেলে প্রবেশের জন্য
            যাচাইকরণ প্রক্রিয়া অনুসরণ করা হয়।
          </p>
        </div>
      </Reveal>
    </div>
  );
}
