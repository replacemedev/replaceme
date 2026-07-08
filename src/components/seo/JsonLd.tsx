/**
 * JsonLd — type-safe JSON-LD script injector.
 *
 * Sanitizes the output to prevent XSS by escaping `<` characters
 * before embedding in dangerouslySetInnerHTML, per Google's recommendation.
 *
 * Usage:
 *   <JsonLd schema={{ "@context": "https://schema.org", "@type": "Organization", ... }} />
 */

interface JsonLdProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema: Record<string, any>;
}

export function JsonLd({ schema }: JsonLdProps) {
  const json = JSON.stringify(schema).replace(/</g, "\\u003c");

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
