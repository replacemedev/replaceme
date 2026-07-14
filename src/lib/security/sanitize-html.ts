/**
 * Allowlist HTML sanitizer for trusted-admin CMS content.
 *
 * Intentionally dependency-free: `isomorphic-dompurify` pulls `jsdom`, which
 * crashes Vercel Node serverless under Turbopack with ERR_REQUIRE_ESM
 * (@exodus/bytes). That took down every route importing CmsHtmlContent
 * (/privacy-policy, /terms-of-service, /cookie-policy, /help/hiring-guide).
 */

const ALLOWED_TAGS = new Set([
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "ul",
  "ol",
  "li",
  "a",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "blockquote",
  "code",
  "pre",
  "span",
  "div",
  "hr",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
]);

const ALLOWED_ATTRS: Record<string, Set<string>> = {
  a: new Set(["href", "title", "rel", "target"]),
  "*": new Set(["class"]),
};

function isSafeHref(value: string): boolean {
  const v = value.trim().toLowerCase();
  return (
    v.startsWith("http://") ||
    v.startsWith("https://") ||
    v.startsWith("mailto:") ||
    v.startsWith("/") ||
    v.startsWith("#")
  );
}

export function sanitizeCmsHtml(dirty: string): string {
  if (!dirty) return "";

  // Drop high-risk tags and their content entirely
  let html = dirty
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, "")
    .replace(/<object[\s\S]*?<\/object>/gi, "")
    .replace(/<embed[\s\S]*?>/gi, "")
    .replace(/<form[\s\S]*?<\/form>/gi, "")
    .replace(/<link[\s\S]*?>/gi, "")
    .replace(/<meta[\s\S]*?>/gi, "");

  html = html.replace(
    /<\/?([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)>/g,
    (full, rawTag: string, rawAttrs: string) => {
      const isClose = full.startsWith("</");
      const tag = rawTag.toLowerCase();
      if (!ALLOWED_TAGS.has(tag)) return "";
      if (isClose) return `</${tag}>`;

      const allowed = new Set([
        ...(ALLOWED_ATTRS["*"] ?? []),
        ...(ALLOWED_ATTRS[tag] ?? []),
      ]);

      const attrs: string[] = [];
      const attrRe =
        /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g;
      let match: RegExpExecArray | null;
      while ((match = attrRe.exec(rawAttrs)) !== null) {
        const name = match[1].toLowerCase();
        const value = match[2] ?? match[3] ?? match[4] ?? "";
        if (name.startsWith("on") || name === "style") continue;
        if (name.startsWith("data-")) continue;
        if (!allowed.has(name)) continue;
        if (name === "href" && !isSafeHref(value)) continue;
        if (name === "target" && value !== "_blank" && value !== "_self") {
          continue;
        }
        const safe = value.replace(/"/g, "&quot;");
        attrs.push(`${name}="${safe}"`);
      }

      if (tag === "a") {
        if (!attrs.some((a) => a.startsWith("rel="))) {
          attrs.push('rel="noopener noreferrer"');
        }
      }

      return attrs.length ? `<${tag} ${attrs.join(" ")}>` : `<${tag}>`;
    }
  );

  return html;
}
