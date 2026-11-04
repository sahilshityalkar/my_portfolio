import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const config = [
  ...nextVitals,
  ...nextTs,
  // docs/ holds prototypes and tooling scripts, not site code
  { ignores: [".next/**", "out/**", "node_modules/**", "next-env.d.ts", "docs/**"] },
];
export default config;
