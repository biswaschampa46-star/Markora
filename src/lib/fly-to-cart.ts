"use client";

/**
 * Launches a small product sprite from `origin` toward the cart badge
 * (`[data-cart-target]`) and bumps the badge when it lands.
 * Falls back to a plain badge bump when motion is reduced.
 */
export function flyToCart(origin: HTMLElement | null | undefined, imageUrl?: string | null): void {
  if (typeof window === "undefined" || !origin) return;
  const target = document.querySelector<HTMLElement>("[data-cart-target]");
  if (!target) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    bumpCart(target);
    return;
  }

  const o = origin.getBoundingClientRect();
  const t = target.getBoundingClientRect();
  const dx = t.left + t.width / 2 - (o.left + o.width / 2);
  const dy = t.top + t.height / 2 - (o.top + o.height / 2);

  const sprite = document.createElement("span");
  sprite.className = "fly-sprite";
  if (imageUrl) {
    sprite.style.backgroundImage = `url(${JSON.stringify(imageUrl)})`;
  }
  sprite.style.left = `${o.left + o.width / 2}px`;
  sprite.style.top = `${o.top + o.height / 2}px`;
  sprite.style.setProperty("--fly-x", `${dx}px`);
  sprite.style.setProperty("--fly-y", `${dy}px`);

  document.body.appendChild(sprite);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => sprite.classList.add("is-flying"));
  });

  window.setTimeout(() => {
    sprite.remove();
    bumpCart(target);
  }, 700);
}

function bumpCart(target: HTMLElement) {
  target.classList.remove("bump");
  // Restart the animation even when the class is already applied.
  void target.offsetWidth;
  target.classList.add("bump");
}
