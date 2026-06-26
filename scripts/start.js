const fs = require("fs");
const { spawnSync } = require("child_process");

const port = process.env.PORT || "3000";
const standalone = ".next/standalone/server.js";

function run(cmd, args) {
  const r = spawnSync(cmd, args, { stdio: "inherit", shell: process.platform === "win32" });
  process.exit(r.status ?? 0);
}

if (fs.existsSync(standalone)) {
  run("node", [standalone]);
} else {
  run("npx", ["next", "start", "-p", port]);
}
