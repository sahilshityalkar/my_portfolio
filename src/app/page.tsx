import { Hero } from "@/components/sections/Hero";
import { Work } from "@/components/sections/Work";
import { Experience } from "@/components/sections/Experience";
import { About } from "@/components/sections/About";
import { Lab } from "@/components/sections/Lab";
import { Writing } from "@/components/sections/Writing";
import { Contact } from "@/components/sections/Contact";
import { Ruler } from "@/components/Ruler";
import { JsonLd, person } from "@/lib/jsonld";
import { PrintOnArrival } from "@/components/PrintButton";
import { profile } from "@/content/profile";

export default function Home() {
  return (
    <>
      <JsonLd data={{ "@type": "ProfilePage", url: profile.siteUrl, mainEntity: person() }} />
      <Hero />
      <Work />
      <Experience />
      <About />
      <Writing />
      <Lab />
      <Contact />
      <Ruler />
      <PrintOnArrival />
    </>
  );
}
