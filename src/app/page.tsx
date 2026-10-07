import { Hero } from "@/components/sections/Hero";
import { Work } from "@/components/sections/Work";
import { Experience } from "@/components/sections/Experience";
import { Lab } from "@/components/sections/Lab";
import { About } from "@/components/sections/About";
import { Contact } from "@/components/sections/Contact";
import { Ruler } from "@/components/Ruler";

export default function Home() {
  return (
    <>
      <Hero />
      <Work />
      <Experience />
      <Lab />
      <About />
      <Contact />
      <Ruler />
    </>
  );
}
