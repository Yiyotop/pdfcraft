import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const config = [
  ...compat.extends("next/core-web-vitals"),
  {
    ignores: [
      ".next/**",
      "out/**",
      "public/**",
      "scratch/**",
      "src-tauri/**",
      "extension/**",
    ],
  },
];

export default config;
