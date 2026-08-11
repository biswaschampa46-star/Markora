import { Mail, MapPin } from "lucide-react";
import { ContactForm } from "@/components/site/ContactForm";
import { Reveal } from "@/components/site/Reveal";

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Reveal variant="up">
        <h1 className="text-xl font-bold text-ink-900 sm:text-2xl">যোগাযোগ করুন</h1>
        <p className="mt-2 text-sm text-ink-500">
          কোনো প্রশ্ন বা মতামত থাকলে নিচের ফর্মটি পূরণ করুন, আমরা যত দ্রুত সম্ভব সাড়া দেব।
        </p>
      </Reveal>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <Reveal variant="up" delay={80}>
          <div className="rounded-xl border border-cream-300 bg-white p-6 shadow-sm">
            <ContactForm />
          </div>
        </Reveal>

        <div className="flex flex-col gap-4">
          <Reveal variant="up" delay={160}>
            <div className="rounded-xl border border-cream-300 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
              <h2 className="flex items-center gap-2 text-sm font-bold text-ink-900">
                <Mail className="h-4 w-4 text-brand-500" />
                সহায়তা কেন্দ্র
              </h2>
              <p className="mt-2 text-sm text-ink-600">
                অর্ডার সংক্রান্ত যেকোনো তথ্যের জন্য অর্ডার নম্বরসহ আমাদের বার্তা পাঠান।
              </p>
            </div>
          </Reveal>
          <Reveal variant="up" delay={240}>
            <div className="rounded-xl border border-cream-300 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
              <h2 className="flex items-center gap-2 text-sm font-bold text-ink-900">
                <MapPin className="h-4 w-4 text-brand-500" />
                সেবা এলাকা
              </h2>
              <p className="mt-2 text-sm text-ink-600">
                Markora বাংলাদেশের সকল জেলায় ডেলিভারি সুবিধা দিয়ে থাকে।
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
