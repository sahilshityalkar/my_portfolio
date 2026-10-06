import { demo, type Text } from "./types";

export const about: { paragraphs: Text[]; principles: { title: string; body: Text }[] } = {
  paragraphs: [
    demo(
      "I’m a frontend engineer from Mumbai. I started out building full-stack apps with the MERN stack and Next.js, and kept drifting towards the part people actually touch — the interface, and the architecture that keeps it fast and honest as a product grows.",
    ),
    demo(
      "At Clyra I lead that work for students and schools. Outside of it I build small products end to end, like ReplyAI, to keep my instincts sharp across the whole stack.",
    ),
  ],
  principles: [
    { title: "On craft", body: demo("The details users never consciously notice are the ones that make a product feel trustworthy.") },
    { title: "On systems", body: demo("A component library is a set of decisions the team no longer has to make. Make them well, once.") },
    { title: "On teams", body: demo("Review the work, not the person — and leave every codebase easier to change than you found it.") },
  ],
};
