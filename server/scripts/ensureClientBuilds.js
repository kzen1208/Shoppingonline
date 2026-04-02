const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const rootDir = path.resolve(__dirname, "..", "..");
const adminDir = path.join(rootDir, "client-admin");
const customerDir = path.join(rootDir, "client-customer");
const adminBuild = path.join(adminDir, "build", "index.html");
const customerBuild = path.join(customerDir, "build", "index.html");

function hasBuilds() {
  return fs.existsSync(adminBuild) && fs.existsSync(customerBuild);
}

function isHostedEnvironment() {
  return Boolean(
    process.env.AUTO_BUILD_CLIENTS ||
      process.env.REPL_ID ||
      process.env.REPL_SLUG ||
      process.env.REPL_OWNER
  );
}

function run(command, cwd) {
  console.log(`> ${command}`);
  execSync(command, {
    cwd,
    stdio: "inherit",
    env: process.env
  });
}

if (hasBuilds()) {
  console.log("Frontend builds found. Skipping automatic build.");
  process.exit(0);
}

if (!isHostedEnvironment()) {
  console.log("Frontend builds are missing. Skipping automatic build outside hosted environment.");
  process.exit(0);
}

console.log("Frontend builds missing. Installing dependencies and building clients.");

run("npm install", adminDir);
run("npm run build", adminDir);
run("npm install", customerDir);
run("npm run build", customerDir);
