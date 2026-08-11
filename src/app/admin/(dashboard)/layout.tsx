import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/supabase/server";
import { isAdminUser } from "@/lib/require-admin";
import { AdminShell } from "@/components/admin/AdminShell";

export const dynamic = "force-dynamic";

export default async function AdminDashboardLayout({ children }: { children: ReactNode }) {
  const user = await getAdminUser();

  if (!user) {
    redirect("/admin/login");
  }

  // Only accounts with the admin role (or an allowlisted email) can enter the
  // dashboard - any other logged-in user is bounced back to the login page.
  if (!isAdminUser(user)) {
    redirect("/admin/login?error=forbidden");
  }

  return <AdminShell email={user.email ?? "অ্যাডমিন"}>{children}</AdminShell>;
}
