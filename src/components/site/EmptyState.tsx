import { PackageOpen } from "lucide-react";

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-cream-300 bg-white px-6 py-14 text-center">
      <span className="flex h-24 w-24 items-center justify-center rounded-full bg-teal-50 text-teal-600">
        <PackageOpen className="h-12 w-12" strokeWidth={1.3} />
      </span>
      <p className="text-base font-semibold text-ink-900">{title}</p>
      {description && <p className="max-w-sm text-sm text-ink-500">{description}</p>}
    </div>
  );
}
