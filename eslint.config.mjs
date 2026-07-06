import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Plain Node scripts, not bundled by Next — CommonJS require() is expected here.
    "scripts/**",
    // AI tooling skill scripts, not part of the application.
    ".claude/**",
    ".codex/**",
  ]),
]);

export default eslintConfig;
