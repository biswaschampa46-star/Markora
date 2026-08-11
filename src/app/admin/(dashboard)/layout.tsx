import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/supabase/server";
import { AdminShell } from "@/components/admin/AdminShell";

export const dynamic = "force-dynamic";

export default async function AdminDashboardLayout({ children }: { children: ReactNode }) {
  const user = await getAdminUser();

  if (!user) {
    redirect("/admin/login");
  }

  return <AdminShell email={user.email ?? "অ্যাডমিন"}>{children}</AdminShell>;
}
