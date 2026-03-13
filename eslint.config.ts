import js from "@eslint/js";
import { readFileSync } from "node:fs";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginVue from "eslint-plugin-vue";
import vueParser from "vue-eslint-parser";
import type { Linter } from "eslint";

const autoImportEslintGlobals = (
  JSON.parse(
    readFileSync(new URL("./types/auto-gen/.eslintrc-auto-import.json", import.meta.url), "utf8"),
  ) as { globals: Record<string, boolean> }
).globals;

const config: Linter.FlatConfig[] = [
  {
    ignores: [
      "dist/**",
      "build/**",
      "node_modules/**",
      "types/**",
      "eslint.config.*",
    ],
  },
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx,vue}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
        ...autoImportEslintGlobals,
      },
    },
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs["flat/essential"],
  {
    files: ["**/*.vue"],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tseslint.parser,
        ecmaVersion: "latest",
        sourceType: "module",
        extraFileExtensions: [".vue"],
      },
    },
    rules: {
      "vue/multi-word-component-names": "off",
    },
  },
  {
    rules: {
      "no-undef": "off",
    },
  },
];

export default config;
