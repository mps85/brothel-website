import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const routesDir = join(root, "backend", "src", "routes");
const readmePath = join(root, "README.md");
const changelogPath = join(root, "CHANGELOG.md");

const order = ["health", "auth", "users", "messages"];

const descriptions = {
  "health:get:/": "Health check + DB status.",
  "auth:post:/login": "Authenticate with email/password; returns user, roles, and session token.",
  "auth:post:/logout": "Revoke the session token.",
  "users:get:/": "List all users and their roles (admin only).",
  "users:post:/": "Create a user, optionally with roles (admin only).",
  "users:delete:/:username": "Delete a user by username (admin only).",
  "messages:get:/": "List all messages (auth required).",
  "messages:get:/:id": "Fetch a message by id, or the newest with \":id=latest\" (auth required).",
  "messages:post:/": "Post a message as the authenticated user.",
};

function parseMounts() {
  const apiSrc = readFileSync(join(routesDir, "api.ts"), "utf8");
  const fileByVar = {};
  for (const m of apiSrc.matchAll(/import\s+(\w+)\s+from\s+"\.\/(\w+)\.js"/g)) {
    fileByVar[m[1]] = m[2];
  }
  const mountByFile = {};
  for (const m of apiSrc.matchAll(/router\.use\(\s*(?:["']([^"']*)["']\s*,\s*)?(\w+)\s*\)/g)) {
    const file = fileByVar[m[2]];
    if (file) mountByFile[file] = m[1] ?? "";
  }
  return mountByFile;
}

function parseRoutes(file) {
  const src = readFileSync(join(routesDir, `${file}.ts`), "utf8");
  const re = /router\.(get|post|put|patch|delete)\(\s*["']([^"']+)["']/g;
  const routes = [];
  for (const m of src.matchAll(re)) {
    const tail = src.slice(m.index + m[0].length);
    const guard = tail.match(/^\s*,\s*(requireAuth|requireRole\("[^"]+"\))/);
    routes.push({
      method: m[1].toUpperCase(),
      path: m[2],
      guard: guard ? guard[1] : "",
    });
  }
  return routes;
}

function accessLabel(guard) {
  if (guard.includes("requireRole")) return "Admin";
  if (guard.includes("requireAuth")) return "Auth";
  return "Public";
}

const mounts = parseMounts();
const rows = [];
for (const file of order) {
  for (const route of parseRoutes(file)) {
    rows.push({
      method: route.method,
      path: `/api${mounts[file] ?? ""}${route.path === "/" ? "" : route.path}`.replace(
        /\/{2,}/g,
        "/"
      ),
      access: accessLabel(route.guard),
      description: descriptions[`${file}:${route.method.toLowerCase()}:${route.path}`] ?? "",
    });
  }
}

const startMarker = "<!-- ENDPOINTS:START -->";
const endMarker = "<!-- ENDPOINTS:END -->";

function renderEndpoints() {
  const table = [
    "| Method | Path | Access | Description |",
    "|--------|------|--------|-------------|",
    ...rows.map(
      (r) => `| ${r.method} | \`${r.path}\` | ${r.access} | ${r.description} |`
    ),
  ].join("\n");
  return `${startMarker}\n## API Endpoints\n\n${table}\n${endMarker}`;
}

function updateReadme() {
  let readme = readFileSync(readmePath, "utf8");
  const block = renderEndpoints();
  if (readme.includes(startMarker) && readme.includes(endMarker)) {
    readme = readme.replace(
      new RegExp(`${startMarker}[\\s\\S]*?${endMarker}`),
      () => block
    );
  } else {
    readme += `\n${block}\n`;
  }
  writeFileSync(readmePath, readme);
}

function gitLog() {
  try {
    const out = execFileSync(
      "git",
      ["log", "--pretty=format:%h|%ad|%s", "--date=short", "--max-count=50"],
      { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }
    );
    return out.trim().split("\n").filter(Boolean);
  } catch {
    return [];
  }
}

function updateChangelog() {
  const entries = gitLog().map((line) => {
    const [hash, date, ...rest] = line.split("|");
    return `- ${rest.join("|")} (${date} — \`${hash}\`)`;
  });
  const content = [
    "# Changelog",
    "",
    "All notable changes to this project are tracked here.",
    "",
    "This file is regenerated automatically by `npm run docs` from git history.",
    "",
    "## Unreleased",
    "",
    entries.length ? entries.join("\n") : "- No commits yet.",
    "",
  ].join("\n");
  writeFileSync(changelogPath, content);
}

updateReadme();
updateChangelog();
console.log(`Docs updated: ${rows.length} endpoints, ${gitLog().length} commits in changelog.`);