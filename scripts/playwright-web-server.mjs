import { existsSync } from "node:fs";
import { join } from "node:path";
import { spawn } from "node:child_process";

const port = process.env.PLAYWRIGHT_PORT ?? "3100";
const buildIdPath = join(process.cwd(), ".next", "BUILD_ID");

if (!existsSync(buildIdPath)) {
  console.log("[playwright] Building Next.js app…");
  await new Promise((resolve, reject) => {
    const build = spawn("npm", ["run", "build"], {
      stdio: "inherit",
      shell: true,
      cwd: process.cwd(),
    });
    build.on("exit", (code) =>
      code === 0 ? resolve() : reject(new Error(`build failed: ${code}`))
    );
  });
}

const child = spawn("npx", ["next", "start", "-p", port], {
  stdio: "inherit",
  shell: true,
  cwd: process.cwd(),
});

process.on("SIGINT", () => child.kill("SIGINT"));
process.on("SIGTERM", () => child.kill("SIGTERM"));

child.on("exit", (code) => process.exit(code ?? 0));
