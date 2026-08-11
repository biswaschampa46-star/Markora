import { getAdminUser } from "@/lib/supabase/server";

export async function requireAdmin() {
  const user = await getAdminUser();
  if (!user) {
    throw new Error("অননুমোদিত অ্যাক্সেস: অ্যাডমিন লগইন প্রয়োজন।");
  }
  return user;
}
