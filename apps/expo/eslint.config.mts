import { defineConfig } from "eslint/config";

import { baseConfig } from "@acme/eslint-config/base";
import { reactConfig } from "@acme/eslint-config/react";

export default defineConfig(
  {
    ignores: [".expo/**", "expo-plugins/**"],
  },
  baseConfig,
  reactConfig,
  {
    rules: {
      // Allow handling unknown error shapes without exhaustive narrowing
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-return": "off",
    },
  },
);
