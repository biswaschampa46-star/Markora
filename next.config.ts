import type { NextConfig } from "next";

// React needs eval() in development mode for debugging features (call-stack
// reconstruction, DevTools integration). Production builds never use eval(),
// so 'unsafe-eval' is only added to the CSP in development - production keeps
// the stricter policy.
const isDev = process.env.NODE_ENV === "development";

const cspValue = [
  "default-src 'self'",
  // 'unsafe-inline' for scripts/styles is required by Next.js's inline
  // bootstrap scripts and React inline style attributes; 'unsafe-eval' (dev
  // only) is required by React's development-mode debugging features.
  // connect-src and img-src allow the Supabase Auth API + Storage (public bucket).
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.supabase.co",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "Content-Security-Policy", value: cspValue },
];

const nextConfig: NextConfig = {
  devIndicators: false,
  poweredByHeader: false,
  images: {
    // Local placeholder/product artwork is served as SVG from /public.
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Product images are stored in Supabase Storage (public bucket) and served
    // from the Supabase project domain.
    remotePatterns: [{ protocol: "https", hostname: "**.supabase.co" }],
  },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
