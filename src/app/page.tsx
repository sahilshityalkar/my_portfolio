import { Hero } from "@/components/sections/Hero";
import { Work } from "@/components/sections/Work";
import { Experience } from "@/components/sections/Experience";
import { About } from "@/components/sections/About";
import { Lab } from "@/components/sections/Lab";
import { Contact } from "@/components/sections/Contact";
import { Ruler } from "@/components/Ruler";

export default function Home() {
  return (
    <>
      <Hero />
      <Work />
      <Experience />
      <About />
      <Lab />
      <Contact />
      <Ruler />
    </>
  );
}
