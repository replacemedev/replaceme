#!/usr/bin/env node
/**
 * Regenerates the auto-synced Repository File Map inside prompt.md
 * from the current workspace (add / rename / delete / move aware).
 *
 * Usage: npm run prompt:sync
 */

import { readdirSync, readFileSync, writeFileSync, existsSync, statSync } from "node:fs";
import { join, relative, posix } from "node:path";
import { execSync } from "node:child_process";
import { TASK_INDEX } from "./prompt-task-index.mjs";

const ROOT = join(import.meta.dirname, "..");
const PROMPT_PATH = join(ROOT, "prompt.md");
const BEGIN = "<!-- PROMPT_SYNC:BEGIN -->";
const END = "<!-- PROMPT_SYNC:END -->";

const ROOT_FILES = [
  "prompt.md",
  "AGENTS.md",
  ".cursorrules",
  "src/proxy.ts",
  ".env.example",
  "package.json",
];

const SCAN_EXTENSIONS = new Set([".ts", ".tsx", ".sql", ".mjs", ".js"]);

function toPosix(p) {
  return p.split("\\").join("/");
}

function rel(p) {
  return toPosix(relative(ROOT, p));
}

function walkFiles(dir, acc = []) {
  if (!existsSync(dir)) return acc;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".") || entry.name === "node_modules") continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walkFiles(full, acc);
    else acc.push(full);
  }
  return acc;
}

function matchGlob(pattern) {
  const normalized = toPosix(pattern);
  if (normalized.includes("*")) {
    const base = normalized.split("*")[0].replace(/\/$/, "");
    const dir = join(ROOT, base);
    if (!existsSync(dir)) return [];
    const files = walkFiles(dir);
    const suffix = normalized.includes("*.")
      ? normalized.slice(normalized.indexOf("*."))
      : null;
    return files
      .map(rel)
      .filter((f) => {
        if (suffix === "*.tsx") return f.endsWith(".tsx");
        if (suffix === "*.ts") return f.endsWith(".ts");
        if (suffix === "*.sql") return f.endsWith(".sql");
        if (normalized.endsWith("/**")) return f.startsWith(base + "/");
        if (normalized.includes("*")) {
          const re = new RegExp(
            "^" + normalized.replace(/\./g, "\\.").replace(/\*\*/g, ".*").replace(/\*/g, "[^/]*") + "$"
          );
          return re.test(f);
        }
        return true;
      })
      .sort();
  }
  const full = join(ROOT, normalized);
  return existsSync(full) ? [normalized] : [];
}

function resolvePatterns(patterns) {
  const out = new Set();
  for (const pattern of patterns) {
    for (const hit of matchGlob(pattern)) out.add(hit);
  }
  return [...out].sort();
}

function listDirFiles(dir, { extensions = SCAN_EXTENSIONS } = {}) {
  if (!existsSync(dir)) return [];
  return walkFiles(dir)
    .map(rel)
    .filter((f) => extensions.has(f.slice(f.lastIndexOf("."))))
    .sort();
}

function formatTxtBlock(lines) {
  return "```txt\n" + lines.join("\n") + "\n```";
}

function buildAppRoutes() {
  const appDir = join(ROOT, "src/app");
  const files = listDirFiles(appDir);
  const interesting = files.filter((f) =>
    /\/(page|layout|route|loading|error|not-found)\.(tsx|ts)$/.test(f)
  );
  return interesting;
}

function buildComponentTree() {
  const base = join(ROOT, "src/components");
  if (!existsSync(base)) return [];
  const lines = [];
  for (const domain of readdirSync(base, { withFileTypes: true }).sort((a, b) =>
    a.name.localeCompare(b.name)
  )) {
    if (!domain.isDirectory() || domain.name.startsWith(".")) continue;
    const domainPath = join(base, domain.name);
    const subdirs = readdirSync(domainPath, { withFileTypes: true })
      .filter((e) => e.isDirectory())
      .map((e) => e.name)
      .sort();
    if (subdirs.length > 0 && domain.name === "shared") {
      lines.push(`src/components/shared/`);
      for (const sub of subdirs) {
        const count = listDirFiles(join(domainPath, sub)).length;
        lines.push(`  shared/${sub}/  (${count} files)`);
      }
    } else {
      const count = listDirFiles(domainPath).length;
      lines.push(`src/components/${domain.name}/  (${count} files)`);
    }
  }
  return lines;
}

function countMigrations() {
  const dir = join(ROOT, "supabase/migrations");
  if (!existsSync(dir)) return 0;
  return readdirSync(dir).filter((f) => f.endsWith(".sql")).length;
}

function parseRoleHomes() {
  const navPath = join(ROOT, "src/config/navigation.ts");
  if (!existsSync(navPath)) {
    return [
      ["Worker", "/worker/job-search"],
      ["Employer", "/employer/dashboard"],
      ["Admin", "/admin/dashboard"],
      ["Public", "/"],
    ];
  }
  const src = readFileSync(navPath, "utf8");
  const block = src.match(/ROLE_HOME_PATH[^=]*=\s*\{([^}]+)\}/s);
  if (!block) return [];
  const rows = [];
  for (const m of block[1].matchAll(/(\w+):\s*"([^"]+)"/g)) {
    rows.push([m[1][0].toUpperCase() + m[1].slice(1), m[2]]);
  }
  rows.push(["Public", "/"]);
  return rows;
}

function gitShortSha() {
  try {
    return execSync("git rev-parse --short HEAD", { cwd: ROOT, stdio: ["ignore", "pipe", "ignore"] })
      .toString()
      .trim();
  } catch {
    return "n/a";
  }
}

function buildGeneratedSection() {
  const ts = new Date().toISOString();
  const sha = gitShortSha();
  const migrations = countMigrations();

  const rootLines = ROOT_FILES.filter((f) => existsSync(join(ROOT, f))).map((f) => {
    if (f === "prompt.md") return `${f}  # This guide (auto-synced file map)`;
    if (f === "proxy.ts") return `${f}  # Middleware entry → src/lib/server/auth/middleware.ts`;
    return f;
  });
  rootLines.push(`supabase/migrations/*.sql  # ${migrations} migration file(s)`);

  const appRoutes = buildAppRoutes();
  const actions = listDirFiles(join(ROOT, "src/actions"));
  const lib = listDirFiles(join(ROOT, "src/lib"));
  const types = listDirFiles(join(ROOT, "src/types"));
  const config = listDirFiles(join(ROOT, "src/config"));
  const hooks = listDirFiles(join(ROOT, "src/hooks"));
  const components = buildComponentTree();

  const taskRows = TASK_INDEX.map(({ area, patterns }) => {
    const resolved = resolvePatterns(patterns);
    const display =
      resolved.length > 6
        ? resolved.slice(0, 5).join(", ") + `, … (+${resolved.length - 5} more)`
        : resolved.join(", ") || "_no matches — check patterns_";
    return `| **${area}** | ${display} |`;
  });

  const roleRows = parseRoleHomes().map(([role, path]) => `| ${role} | \`${path}\` |`);

  return `${BEGIN}
### Repository File Map (auto-generated from workspace)

**Last synced:** ${ts} · **Git:** \`${sha}\`
**Regenerate:** \`npm run prompt:sync\` after any add, rename, delete, or move under \`src/\`, \`supabase/migrations/\`, or root entry files.

**Agent rule:** Use this map + **Task → Files**. Do not broad-scan the repo. If a path is missing here, run \`npm run prompt:sync\` (or ask the user to).

#### Repo root (non-src)

${formatTxtBlock(rootLines)}

#### \`src/app/\` — routes (App Router) — ${appRoutes.length} route files

${formatTxtBlock(appRoutes)}

#### \`src/actions/\` — Server Actions (${actions.length} files)

${formatTxtBlock(actions)}

#### \`src/lib/\` — infra, DAL, validations (${lib.length} files)

${formatTxtBlock(lib)}

#### \`src/components/\` — UI domains

${formatTxtBlock(components)}

#### \`src/types/\` (${types.length}) · \`src/config/\` (${config.length}) · \`src/hooks/\` (${hooks.length})

${formatTxtBlock([...types, ...config, ...hooks])}

#### Task → Files (patterns resolved at sync — open these first)

| Task area | Paths (existing in workspace) |
|-----------|-------------------------------|
${taskRows.join("\n")}

#### Role home paths (from \`src/config/navigation.ts\`)

| Role | Home after login |
|------|------------------|
${roleRows.join("\n")}
${END}`;
}

function main() {
  if (!existsSync(PROMPT_PATH)) {
    console.error("prompt.md not found at", PROMPT_PATH);
    process.exit(1);
  }

  const prompt = readFileSync(PROMPT_PATH, "utf8");
  const generated = buildGeneratedSection();

  let updated;
  if (prompt.includes(BEGIN) && prompt.includes(END)) {
    updated = prompt.replace(new RegExp(`${BEGIN}[\\s\\S]*?${END}`), generated);
  } else {
    const anchor = "### Repository File Map";
    const altAnchor = "### Always-On Invariants";
    if (!prompt.includes(anchor)) {
      console.error("Could not find insertion point in prompt.md");
      process.exit(1);
    }
    const start = prompt.indexOf(anchor);
    const end = prompt.indexOf(altAnchor, start);
    updated =
      prompt.slice(0, start) + generated + "\n\n" + prompt.slice(end);
  }

  writeFileSync(PROMPT_PATH, updated, "utf8");
  console.log("✓ prompt.md file map synced at", new Date().toISOString());
}

main();
