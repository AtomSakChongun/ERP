import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// Bulletproof React: unidirectional architecture  shared → features → app.
// Features must not import from each other; compose them in `src/app`.
const features = ["auth", "dashboard", "employees", "history", "leave", "overtime", "reports", "settings", "team", "timesheet"];
const shared = ["components", "config", "hooks", "lib", "styles", "testing", "types", "utils"].map((d) => `./src/${d}`);

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "import/no-restricted-paths": [
        "error",
        {
          zones: [
            ...features.map((f) => ({
              target: `./src/features/${f}`,
              from: "./src/features",
              except: [`./${f}`],
              message: "Features must not import other features. Compose them in src/app instead.",
            })),
            {
              target: ["./src/features", ...shared],
              from: "./src/app",
              message: "Only the app layer may import from src/app.",
            },
            {
              target: shared,
              from: "./src/features",
              message: "Shared modules must not depend on features.",
            },
          ],
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // AI agent harness folders (impeccable skills, hooks, scripts):
    ".agent/**",
    ".agents/**",
    ".claude/**",
    ".codex/**",
    ".cursor/**",
    ".gemini/**",
    ".kiro/**",
  ]),
]);

export default eslintConfig;
