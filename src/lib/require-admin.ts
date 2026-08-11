import { getAdminUser } from "@/lib/supabase/server";
import { isAdminUser } from "@/lib/admin-role";

export { isAdminUser };

export async function requireAdmin() {
  const user = await getAdminUser();

  if (!user) {
    throw new Error("অননুমোদিত অ্যাক্সেস: অ্যাডমিন লগইন প্রয়োজন।");
  }

  if (!isAdminUser(user)) {
    throw new Error("অননুমোদিত অ্যাক্সেস: এই অ্যাকাউন্টে অ্যাডমিন অনুমতি নেই।");
  }

  return user;
}
