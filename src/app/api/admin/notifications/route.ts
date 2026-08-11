import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/supabase/server";
import { isAdminUser } from "@/lib/require-admin";
import { getAdminOrderNotificationCounts } from "@/lib/queries";

export const dynamic = "force-dynamic";

// Lightweight poll endpoint for the admin sidebar "new orders" badge. Returns
// the unread and pending order counts so the badge can refresh live without
// reloading the page. Admin-only: any other caller gets a 401.
export async function GET() {
  const user = await getAdminUser();

  if (!user || !isAdminUser(user)) {
    return NextResponse.json({ error: "অননুমোদিত অ্যাক্সেস" }, { status: 401 });
  }

  return NextResponse.json(await getAdminOrderNotificationCounts());
}
