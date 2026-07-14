/**
 * DOMPurify-backed HTML sanitizer for CMS content rendered via dangerouslySetInnerHTML.
 * Allowlist mirrors the previous regex sanitizer; DOMPurify handles mutation XSS properly.
 */
import DOMPurify from "isomorphic-dompurify";

const ALLOWED_TAGS = [
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
];

const ALLOWED_ATTR = ["href", "title", "rel", "target", "class"];

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

  const clean = DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: ["style", "script", "iframe", "object", "embed", "form"],
    FORBID_ATTR: ["style"],
  });

  // Enforce safe href / target after DOMPurify (defense in depth)
  return clean.replace(
    /<a\b([^>]*)>/gi,
    (full, rawAttrs: string) => {
      let href = "";
      let title = "";
      let target = "";
      let className = "";
      const attrRe =
        /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g;
      let match: RegExpExecArray | null;
      while ((match = attrRe.exec(rawAttrs)) !== null) {
        const name = match[1].toLowerCase();
        const value = match[2] ?? match[3] ?? match[4] ?? "";
        if (name === "href") href = value;
        if (name === "title") title = value;
        if (name === "target") target = value;
        if (name === "class") className = value;
      }

      if (href && !isSafeHref(href)) return "";

      const attrs: string[] = [];
      if (href) attrs.push(`href="${href.replace(/"/g, "&quot;")}"`);
      if (title) attrs.push(`title="${title.replace(/"/g, "&quot;")}"`);
      if (className) attrs.push(`class="${className.replace(/"/g, "&quot;")}"`);
      if (target === "_blank" || target === "_self") {
        attrs.push(`target="${target}"`);
        attrs.push('rel="noopener noreferrer"');
      } else {
        attrs.push('rel="noopener noreferrer"');
      }

      return attrs.length ? `<a ${attrs.join(" ")}>` : "<a>";
    }
  );
}
