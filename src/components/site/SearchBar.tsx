"use client";

import { Search } from "lucide-react";

export function SearchBar({ defaultValue = "" }: { defaultValue?: string }) {
  return (
    <form action="/search" method="GET" className="search-shell flex w-full items-stretch rounded-lg">
      <input
        type="text"
        name="q"
        defaultValue={defaultValue}
        placeholder="পণ্য, ব্র্যান্ড অথবা ক্যাটাগরি খুঁজুন"
        className="w-full rounded-l-lg border-2 border-r-0 border-brand-500 bg-white px-4 py-2.5 text-sm text-ink-900 caret-brand-600 outline-none transition-colors placeholder:text-ink-300 focus:border-brand-600"
      />
      <button
        type="submit"
        aria-label="খুঁজুন"
        className="ripple-host press flex items-center justify-center rounded-r-lg bg-brand-500 px-4 text-white transition hover:bg-brand-600"
      >
        <Search className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" strokeWidth={2} />
      </button>
    </form>
  );
}
