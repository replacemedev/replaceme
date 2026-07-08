/**
 * OrganizationSchema — global entity graph for Replace Me.
 *
 * Injects stacked JSON-LD covering:
 *  - @type: Organization  (brand identity)
 *  - @type: SoftwareApplication  (product entity)
 *
 * Placed in the root layout so every public page inherits brand entity data.
 * AI engines use this to confidently identify and cite the brand.
 */

import { JsonLd } from "./JsonLd";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://replaceme.ph";

export function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${BASE_URL}/#organization`,
        name: "Replace Me",
        alternateName: "ReplaceMe",
        url: BASE_URL,
        logo: {
          "@type": "ImageObject",
          url: `${BASE_URL}/images/logo_favicon.png`,
          width: 512,
          height: 512,
        },
        sameAs: [
          // Add social profile URLs here when available
        ],
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer support",
          url: `${BASE_URL}/contact`,
          availableLanguage: ["English"],
        },
        description:
          "Replace Me is a direct-hire Filipino remote talent marketplace connecting global employers with top-tier Filipino professionals — without agency fees or salary commissions.",
        areaServed: {
          "@type": "Country",
          name: "Philippines",
        },
        foundingLocation: {
          "@type": "Country",
          name: "Philippines",
        },
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${BASE_URL}/#software`,
        name: "Replace Me",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        url: BASE_URL,
        offers: [
          {
            "@type": "Offer",
            name: "Discovery",
            price: "0",
            priceCurrency: "USD",
            description: "Free tier for employers to post jobs and see anonymous applicant previews.",
          },
          {
            "@type": "Offer",
            name: "Starter",
            description: "Unlocks full applicant profiles and resumes.",
          },
          {
            "@type": "Offer",
            name: "Growth",
            description: "Includes direct messaging with candidates.",
          },
          {
            "@type": "Offer",
            name: "Scale",
            description: "Full platform access for high-volume hiring teams.",
          },
        ],
        author: {
          "@id": `${BASE_URL}/#organization`,
        },
        description:
          "Replace Me is a subscription-based SaaS platform for direct remote hiring. Employers access a curated Filipino talent pool at a flat subscription rate — zero agency markups, zero salary commissions.",
        featureList: [
          "Direct-hire marketplace",
          "Zero placement fees",
          "Zero salary commission",
          "Built-in applicant tracking pipeline",
          "In-platform messaging",
          "Offer and contract management",
          "Filipino remote talent pool",
          "Free for job seekers",
        ],
      },
      {
        "@type": "WebSite",
        "@id": `${BASE_URL}/#website`,
        url: BASE_URL,
        name: "Replace Me",
        description: "Hire top Filipino remote talent directly — no agency fees, no middlemen.",
        publisher: {
          "@id": `${BASE_URL}/#organization`,
        },
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${BASE_URL}/jobs?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return <JsonLd schema={schema} />;
}
