import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const relativeImports = { group: ["./*", "../*"], message: "Use the @/ alias instead of relative imports." };
const dataImports = { group: ["@/data/*"], message: "Read catalogue data through @/services, not @/data." };
const linkImport = { name: "next/link", message: "Use @/components/ui/AppLink so the unsaved-changes guard runs." };
const iconImport = { name: "lucide-react", message: "Import icons from @/components/ui/icons." };

function restrictImports({ paths = [linkImport, iconImport], patterns = [relativeImports, dataImports] } = {}) {
  return { "no-restricted-imports": ["error", { paths, patterns }] };
}

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  { files: ["src/**/*.{ts,tsx}"], rules: restrictImports() },
  { files: ["src/services/**/*.ts", "src/server/db/seed.ts"], rules: restrictImports({ patterns: [relativeImports] }) },
  { files: ["src/components/ui/AppLink.tsx"], rules: restrictImports({ paths: [iconImport] }) },
  { files: ["src/components/ui/icons.ts"], rules: restrictImports({ paths: [linkImport] }) },
  globalIgnores([".next/**", ".open-next/**", ".wrangler/**", "out/**", "build/**", "next-env.d.ts"]),
]);

export default eslintConfig;
