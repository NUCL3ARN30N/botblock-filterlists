#!/usr/bin/env node
/*
 * Validates every *.json filter list in this repo against the schema
 * BotBlock's background.js actually consumes (see fetchFilterList /
 * sanitizeListWidgets there). No dependencies — this runs in CI with just
 * a Node checkout, no npm install step.
 *
 * Exit code 0 = all files valid (warnings allowed). Exit code 1 = at least
 * one hard error, which should block the PR.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");

// Bare, single-word tokens are too broad — "chat" alone would match any
// element with "chat" anywhere in its class/id, catching huge swaths of
// unrelated sites. Require vendor-specific tokens instead.
const BANNED_BARE_TOKENS = new Set([
  "chat", "bot", "widget", "ai", "assistant", "support", "help", "helper",
  "launcher", "bubble", "button", "frame", "iframe", "app", "messenger",
  "message", "messages", "live", "agent",
]);

const HOSTNAME_RE = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$/i;
const KEY_RE = /^[a-z0-9][a-z0-9-]*$/;

let errors = 0;
let warnings = 0;

function fail(file, message) {
  errors++;
  console.error(`::error file=${file}::${message}`);
}

function warn(file, message) {
  warnings++;
  console.warn(`::warning file=${file}::${message}`);
}

function findListFiles() {
  return fs
    .readdirSync(ROOT)
    .filter((f) => f.endsWith(".json"))
    .filter((f) => {
      try {
        const data = JSON.parse(fs.readFileSync(path.join(ROOT, f), "utf8"));
        return data && typeof data === "object" && data.botblockFilterList === true;
      } catch (e) {
        return true; // malformed JSON still gets reported below, not silently skipped
      }
    });
}

function validateWidget(file, w, index, seenKeys) {
  const label = `widgets[${index}]${w && w.name ? ` ("${w.name}")` : ""}`;

  if (!w || typeof w !== "object" || Array.isArray(w)) {
    fail(file, `${label}: entry must be a JSON object.`);
    return;
  }

  if (typeof w.name !== "string" || !w.name.trim()) {
    fail(file, `${label}: "name" is required and must be a non-empty string.`);
  }

  if (w.key !== undefined) {
    if (typeof w.key !== "string" || !KEY_RE.test(w.key)) {
      fail(file, `${label}: "key" must be lowercase letters/digits/hyphens only (e.g. "acme-chat").`);
    } else {
      const lower = w.key.toLowerCase();
      if (seenKeys.has(lower)) {
        fail(file, `${label}: duplicate key "${w.key}" — keys must be unique within a list.`);
      }
      seenKeys.add(lower);
    }
  }

  if (!Array.isArray(w.tokens) || !w.tokens.length) {
    fail(file, `${label}: "tokens" is required and must be a non-empty array of strings.`);
  } else {
    for (const t of w.tokens) {
      if (typeof t !== "string" || !t.trim()) {
        fail(file, `${label}: every token must be a non-empty string (got ${JSON.stringify(t)}).`);
        continue;
      }
      if (BANNED_BARE_TOKENS.has(t.trim().toLowerCase())) {
        fail(
          file,
          `${label}: token "${t}" is too generic and would match unrelated elements site-wide — use a vendor-specific substring instead (e.g. "acme-chat" rather than "chat").`
        );
      }
    }
  }

  if (w.domains !== undefined) {
    if (!Array.isArray(w.domains)) {
      fail(file, `${label}: "domains" must be an array of hostnames if present.`);
    } else {
      for (const d of w.domains) {
        if (typeof d !== "string" || !HOSTNAME_RE.test(d.trim())) {
          fail(
            file,
            `${label}: "${d}" doesn't look like a bare hostname — no "https://", no path, no wildcards (e.g. "widget.acme.com").`
          );
        }
      }
    }
  }
}

function validateFile(relFile) {
  const full = path.join(ROOT, relFile);
  let raw;
  try {
    raw = fs.readFileSync(full, "utf8");
  } catch (e) {
    fail(relFile, `Couldn't read file: ${e.message}`);
    return;
  }

  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    fail(relFile, `Invalid JSON: ${e.message}`);
    return;
  }

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    fail(relFile, "Top level must be a JSON object.");
    return;
  }

  if (data.botblockFilterList !== true) {
    fail(relFile, '"botblockFilterList" must be exactly `true`.');
  }

  if (data.name !== undefined && (typeof data.name !== "string" || !data.name.trim())) {
    fail(relFile, '"name" must be a non-empty string if present.');
  }

  if (data.updatedAt !== undefined) {
    const parsed = Date.parse(data.updatedAt);
    if (Number.isNaN(parsed)) {
      warn(relFile, `"updatedAt" ("${data.updatedAt}") isn't a parseable date — use ISO 8601, e.g. "2026-08-06T00:00:00Z".`);
    }
  }

  if (!Array.isArray(data.widgets)) {
    fail(relFile, '"widgets" is required and must be an array.');
    return;
  }

  if (data.widgets.length > 200) {
    fail(relFile, `${data.widgets.length} widgets exceeds the 200-per-list cap BotBlock enforces on fetch — entries beyond 200 would silently be dropped.`);
  }

  const seenKeys = new Set();
  data.widgets.forEach((w, i) => validateWidget(relFile, w, i, seenKeys));

  console.log(`${relFile}: ${data.widgets.length} widget${data.widgets.length === 1 ? "" : "s"} checked.`);
}

const files = findListFiles();
if (!files.length) {
  console.error("No filter list files found (looking for *.json with \"botblockFilterList\": true at the repo root).");
  process.exit(1);
}

console.log(`Validating ${files.length} filter list file(s): ${files.join(", ")}\n`);
for (const f of files) validateFile(f);

console.log(`\n${errors} error(s), ${warnings} warning(s).`);
process.exit(errors > 0 ? 1 : 0);
