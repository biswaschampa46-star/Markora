import Image from "next/image";

/**
 * Markora brand logo (icon + wordmark from /public/logo.png).
 *
 * The artwork is dark-navy line art on a transparent background, so on the
 * site's dark navy surfaces (header, footer, preloader, admin sidebar) it is
 * rendered on a small white chip for contrast. Pass `chip={false}` when the
 * logo sits on a light background (e.g. the white admin login card).
 *
 * Size the logo via `className` — pass a height utility like "h-9"; the width
 * follows automatically from the image's intrinsic 3:2 aspect ratio.
 */
export function SiteLogo({
  className = "h-9",
  chip = true,
  priority = false,
  alt = "Markora",
}: {
  className?: string;
  chip?: boolean;
  priority?: boolean;
  alt?: string;
}) {
  const image = (
    <Image
      src="/logo.png"
      alt={alt}
      width={768}
      height={512}
      priority={priority}
      className={chip ? "h-full w-auto" : `w-auto ${className}`}
    />
  );

  if (!chip) return image;

  return (
    <span
      className={`flex shrink-0 items-center rounded-lg bg-white px-1.5 py-1 shadow-sm ring-1 ring-navy-950/10 ${className}`}
    >
      {image}
    </span>
  );
}
