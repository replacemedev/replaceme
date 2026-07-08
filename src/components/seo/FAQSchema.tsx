/**
 * FAQSchema — AEO FAQ structured data component.
 *
 * Injects a FAQPage JSON-LD script targeting:
 *  - Google Featured Snippets (zero-click answers)
 *  - Voice assistants (Alexa, Siri, Google Assistant)
 *  - AI search engines (Perplexity, ChatGPT, Gemini)
 *
 * Usage:
 *   <FAQSchema items={[{ question: "...", answer: "..." }]} />
 *
 * Place this in the server component (page.tsx), not a client component,
 * so the JSON-LD is present in the initial HTML response.
 */

import { JsonLd } from "./JsonLd";

export interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSchemaProps {
  items: FAQItem[];
}

export function FAQSchema({ items }: FAQSchemaProps) {
  if (!items.length) return null;

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return <JsonLd schema={schema} />;
}
