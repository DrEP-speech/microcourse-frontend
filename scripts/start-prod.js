/**
 * Smart production start:
 * - If standalone server exists, run it (best for cloud/prod)
 * - Else fallback to `next start`
 */
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const PORT = process.env.PORT || "3000";

function run(cmd, args, extraEnv = {}) {
  const res = spawnSync(cmd, args, {
    stdio: "inherit",
    shell: process.platform === "win32",
    env: { ...process.env, PORT, ...extraEnv },
  });
  process.exit(res.status ?? 0);
}

const standaloneServer = path.join(process.cwd(), ".next", "standalone", "server.js");
const hasStandalone = fs.existsSync(standaloneServer);

if (hasStandalone) {
  console.log(`[start-prod] Standalone detected -> node .next/standalone/server.js (PORT=${PORT})`);
  run("node", [standaloneServer]);
}

console.log(`[start-prod] Standalone not found -> next start -p ${PORT}`);
run("node", ["node_modules/next/dist/bin/next", "start", "-p", PORT]);
