import { defineConfig, globalIgnores } from "eslint/config";
import eslintConfigNext from "eslint-config-next";

const eslintConfig = defineConfig([
  eslintConfigNext,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
