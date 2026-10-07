import { isDraft, type Text } from "@/content/types";

/** Renders real text, or a deliberate "in preparation" mark for a draft. */
export function T({ v, as: Tag = "span", className = "" }: { v: Text; as?: "span" | "p" | "h3" | "dd"; className?: string }) {
  if (isDraft(v)) {
    return (
      <Tag className={`${className} draft`} title="Placeholder. See PLACEHOLDERS.md">
        {v.hint}
      </Tag>
    );
  }
  return <Tag className={className}>{v}</Tag>;
}

export const plain = (v: Text, fallback = "") => (isDraft(v) ? fallback : v);
