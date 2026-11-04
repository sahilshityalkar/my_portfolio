import { links, profile } from "@/content/profile";
import { about } from "@/content/about";
import { education } from "@/content/experience";

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
    description: profile.statement,
    image: `${profile.siteUrl}/opengraph-image`,
    // the Toolkit's languages and frontend groups, as listed on the page
    knowsAbout: about.toolkit.filter((g) => g.group === "Languages" || g.group === "Frontend").flatMap((g) => g.items),
    alumniOf: education.map((e) => ({ "@type": "CollegeOrUniversity", name: e.school })),
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
