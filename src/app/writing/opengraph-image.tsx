import { profile } from "@/content/profile";
import { cardSize, noteCard } from "@/lib/note-card";
import { lede } from "./lede";

export const size = cardSize;
export const contentType = "image/png";
export const alt = `Writing by ${profile.name}: notes on frontend engineering`;

/** The index's share card, in the same set as the notes' own. */
export default function OG() {
  return noteCard({ label: "Notes", meta: "Frontend engineering", title: "Writing", kicker: lede });
}
