/** Sticky guest `Header` uses `h-16` (4rem). */
export const PUBLIC_HEADER_OFFSET = "pt-16";

/** Info / footer-linked pages: clear header + compact body gap (matches login rhythm). */
export const PUBLIC_PAGE_TOP = "pt-20";

/** px below viewport top: h-16 header + breathing room for section titles. */
export const PUBLIC_HEADER_SCROLL_OFFSET = 50;

export function scrollToPublicSection(id: string) {
  const target = document.getElementById(id);
  if (!target) return;

  const top =
    target.getBoundingClientRect().top +
    window.scrollY -
    PUBLIC_HEADER_SCROLL_OFFSET;

  window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
}
