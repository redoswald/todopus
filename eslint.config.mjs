import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Stylistic rule the pre-migration config didn't enforce
      "react/no-unescaped-entities": "off",
      // New react-hooks compiler rules flag pre-existing (working) effect
      // patterns; kept as warnings until the cleanup pass in intend-web#30
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/refs": "warn",
      "react-hooks/immutability": "warn",
      "react-hooks/purity": "warn",
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "dist/**",
    "next-env.d.ts",
    "scripts/**",
    "tailwind.config.mjs",
    "postcss.config.mjs",
  ]),
]);

export default eslintConfig;
