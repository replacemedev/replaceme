/**
 * BreadcrumbList JSON-LD — helps Google + AI engines map site hierarchy.
 */

import { JsonLd } from "./JsonLd";

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function BreadcrumbSchema({ items }: { items: BreadcrumbItem[] }) {
  if (items.length < 2) return null;

  return (
    <JsonLd
      schema={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: item.name,
          item: item.url,
        })),
      }}
    />
  );
}
