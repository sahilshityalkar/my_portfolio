import { links, profile } from "@/content/profile";

/**
 * Structured data, from verified facts only (see PLACEHOLDERS.md): who this
 * is, where they work, where else they are. Rendered as a script tag, with
 * `<` escaped, as the Next.js JSON-LD guide recommends.
 */
export const personId = `${profile.siteUrl}/#person`;

export function person() {
  const sameAs = [links.github, links.linkedin, links.x].filter((v): v is string => !!v);
  return {
    "@type": "Person",
    "@id": personId,
    name: profile.name,
    jobTitle: profile.role,
    url: profile.siteUrl,
    ...(links.email ? { email: `mailto:${links.email}` } : {}),
    worksFor: {
      "@type": "Organization",
      name: profile.company,
      ...(profile.companyUrl ? { url: profile.companyUrl } : {}),
    },
    address: { "@type": "PostalAddress", addressLocality: "Mumbai", addressCountry: "IN" },
    sameAs,
  };
}

export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", ...data }).replace(/</g, "\\u003c") }}
    />
  );
}
