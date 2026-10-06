import type { ComponentType } from "react";
import Glass from "./glass";

/** slug → experiment component. Pair each entry with one in src/content/lab.ts. */
export const experiments: Record<string, ComponentType> = {
  glass: Glass,
};
