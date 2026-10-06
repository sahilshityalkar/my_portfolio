import { draft, type Text } from "./types";

export const about: { paragraphs: Text[]; principles: { title: string; body: Text }[] } = {
  paragraphs: [
    draft("Two or three sentences in your own voice: how you got into frontend, and what you care about in the work."),
    draft("Outside the editor — optional. One line is enough."),
  ],
  principles: [
    { title: "On craft", body: draft("A belief about interface quality you actually hold.") },
    { title: "On systems", body: draft("How you think about architecture, components or design systems.") },
    { title: "On teams", body: draft("How you lead, review or collaborate.") },
  ],
};
