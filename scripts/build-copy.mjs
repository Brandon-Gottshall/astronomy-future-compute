#!/usr/bin/env node
// Reads content/copy.yaml → writes lib/copy.js
// Run manually: node scripts/build-copy.mjs
// Runs automatically via predev / prebuild npm scripts.

import { readFileSync, writeFileSync } from "fs";
import { load } from "js-yaml";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const yaml = readFileSync(resolve(root, "content/copy.yaml"), "utf8");
const copy = load(yaml);

const output = `// AUTO-GENERATED — edit content/copy.yaml, not this file.
export const COPY = ${JSON.stringify(copy, null, 2)};
`;

writeFileSync(resolve(root, "lib/copy.js"), output);
console.log("✓ lib/copy.js generated from content/copy.yaml");
