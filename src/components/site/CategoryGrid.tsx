import Link from "next/link";
import { getCategoryIcon } from "@/lib/icon-map";
import { Reveal } from "./Reveal";

type Category = { slug: string; nameBn: string; icon: string };

export function CategoryGrid({ categories }: { categories: Category[] }) {
  return (
    <div className="grid grid-cols-4 gap-3 sm:grid-cols-4 md:grid-cols-8">
      {categories.map((category, i) => {
        const Icon = getCategoryIcon(category.icon);
        return (
          <Reveal key={category.slug} variant="scale" delay={Math.min(i * 50, 400)}>
            <Link
              href={`/category/${category.slug}`}
              data-ripple
              className="ripple-host group flex flex-col items-center gap-2 rounded-xl border border-cream-300 bg-white p-3 text-center shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-brand-400 hover:shadow-lg hover:shadow-brand-500/10"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-teal-50 transition-all duration-300 group-hover:scale-110 group-hover:bg-brand-50">
                <Icon
                  className="h-6 w-6 text-teal-600 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:text-brand-600"
                  strokeWidth={1.6}
                />
              </span>
              <span className="text-xs font-medium leading-tight text-ink-900 transition-colors duration-300 group-hover:text-brand-700">
                {category.nameBn}
              </span>
            </Link>
          </Reveal>
        );
      })}
    </div>
  );
}
