import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { getCategories } from "@/lib/queries";
import { getCategoryIcon } from "@/lib/icon-map";
import { toBanglaDigits } from "@/lib/format";
import { createCategory, deleteCategory } from "@/app/admin/(dashboard)/actions";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { ConfirmButton } from "@/components/admin/ConfirmButton";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-ink-900">ক্যাটাগরি সমূহ</h1>
        <p className="text-sm text-ink-500">সাইটের ক্যাটাগরি পরিচালনা করুন</p>
      </div>

      <div className="rounded-xl border border-cream-300 bg-white p-5">
        <h2 className="text-sm font-bold text-ink-900">নতুন ক্যাটাগরি</h2>
        <div className="mt-4">
          <CategoryForm action={createCategory} submitLabel="ক্যাটাগরি যোগ করুন" />
        </div>
      </div>

      {categories.length === 0 ? (
        <div className="rounded-xl border border-cream-300 bg-white p-10 text-center text-sm text-ink-500">
          এখনো কোনো ক্যাটাগরি নেই — উপরের ফর্ম দিয়ে প্রথম ক্যাটাগরি যোগ করুন।
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-cream-300 bg-white">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-cream-200 text-xs uppercase text-ink-500">
                <th className="px-4 py-3">আইকন</th>
                <th className="px-4 py-3">নাম</th>
                <th className="px-4 py-3">স্লাগ</th>
                <th className="px-4 py-3">ক্রম</th>
                <th className="px-4 py-3 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => {
                const Icon = getCategoryIcon(category.icon);
                return (
                  <tr
                    key={category.id}
                    data-row
                    className="border-b border-cream-100 transition last:border-0 hover:bg-cream-50"
                  >
                    <td className="px-4 py-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
                        <Icon className="h-4.5 w-4.5" strokeWidth={1.8} />
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-ink-900">{category.nameBn}</td>
                    <td className="px-4 py-3 text-ink-700">{category.slug}</td>
                    <td className="px-4 py-3 text-ink-700">{toBanglaDigits(category.sortOrder)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/categories/${category.id}/edit`}
                          className="flex items-center gap-1 rounded-lg border border-cream-300 px-2.5 py-1.5 text-xs font-medium text-ink-700 transition hover:bg-cream-100"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          সম্পাদনা
                        </Link>
                        <ConfirmButton
                          action={deleteCategory.bind(null, category.id)}
                          confirmText={`"${category.nameBn}" ক্যাটাগরিটি মুছে ফেলবেন?`}
                          className="flex items-center gap-1 rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          মুছুন
                        </ConfirmButton>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
