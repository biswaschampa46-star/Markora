import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnv } from "@/lib/supabase/config";
import { isAdminUser } from "@/lib/admin-role";

const PUBLIC_ADMIN_PATHS = ["/admin/login", "/admin/setup"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const env = getSupabaseEnv();

  if (!env) {
    if (pathname === "/admin/setup") {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/admin/setup", request.url));
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isPublicAdminPath = PUBLIC_ADMIN_PATHS.includes(pathname);

  if (!user && !isPublicAdminPath) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  if (user) {
    // Logged in but not an admin: block the whole dashboard and show the
    // "no permission" message on the login page (avoids a redirect loop).
    if (!isPublicAdminPath && !isAdminUser(user)) {
      return NextResponse.redirect(new URL("/admin/login?error=forbidden", request.url));
    }
    // Admins who are already signed in skip the login page.
    if (pathname === "/admin/login" && isAdminUser(user)) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
