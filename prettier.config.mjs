/** @type {import("prettier").Config} */
export default {
  proseWrap: "always",
  trailingComma: "all",
  overrides: [
    {
      files: "apps/customer/**",
      options: {
        plugins: [
          "@prettier/plugin-pug",
          "prettier-plugin-organize-imports",
          "prettier-plugin-tailwindcss",
        ],
        printWidth: 120,
        semi: false,
        singleQuote: true,
        trailingComma: "none",
        arrowParens: "avoid",
        organizeImportsSkipDestructiveCodeActions: true,
        tailwindStylesheet: fileURLToPath(
          new URL(
            "./apps/customer/src/assets/css/tailwind.css",
            import.meta.url,
          ),
        ),
        pugClassNotation: "as-is",
        pugSingleQuote: false,
        pugWrapAttributesThreshold: 1,
      },
    },
  ],
};
import { fileURLToPath } from "node:url";
