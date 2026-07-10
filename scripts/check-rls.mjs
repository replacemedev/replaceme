#!/usr/bin/env node
/**
 * Fails if any public table from generated types lacks ENABLE ROW LEVEL SECURITY
 * in supabase/migrations. Run: npm run check:rls
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const typesPath = join(root, "src/types/database.ts");
const migrationsDir = join(root, "supabase/migrations");

const types = readFileSync(typesPath, "utf8");
const tablesBlock = types.match(/Tables:\s*\{([\s\S]*?)\n\s*Views:/);
if (!tablesBlock) {
  console.error("Could not parse Tables from src/types/database.ts");
  process.exit(1);
}

const tableNames = [
  ...tablesBlock[1].matchAll(/^\s{6}([a-z][a-z0-9_]*)\s*:\s*\{/gm),
].map((m) => m[1]);

const migrationSql = readdirSync(migrationsDir)
  .filter((f) => f.endsWith(".sql"))
  .map((f) => readFileSync(join(migrationsDir, f), "utf8"))
  .join("\n");

const missing = [];
for (const table of tableNames) {
  const re = new RegExp(
    `ENABLE\\s+ROW\\s+LEVEL\\s+SECURITY[\\s\\S]{0,80}\\b${table}\\b|ALTER\\s+TABLE\\s+(?:public\\.)?${table}\\s+ENABLE\\s+ROW\\s+LEVEL\\s+SECURITY`,
    "i"
  );
  // Also accept: ALTER TABLE ... table ENABLE ROW LEVEL SECURITY
  const re2 = new RegExp(
    `ALTER\\s+TABLE\\s+(?:ONLY\\s+)?(?:public\\.)?"?${table}"?\\s+ENABLE\\s+ROW\\s+LEVEL\\s+SECURITY`,
    "i"
  );
  if (!re.test(migrationSql) && !re2.test(migrationSql)) {
    missing.push(table);
  }
}

if (missing.length) {
  console.error(
    `RLS check failed — no ENABLE ROW LEVEL SECURITY found for:\n  - ${missing.join("\n  - ")}`
  );
  process.exit(1);
}

console.log(`RLS check passed (${tableNames.length} tables).`);
