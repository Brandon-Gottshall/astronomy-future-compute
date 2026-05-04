#!/usr/bin/env node
// Build-time PDF generator. Spawns `next start`, navigates a headless
// Chromium to /, and writes public/<pdfFilename> via page.pdf().
// Wired into npm `build` after `next build`.

import { spawn } from "child_process";
import { existsSync, mkdirSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const { COPY } = await import(resolve(root, "lib/copy.js"));
const PDF_FILENAME = COPY.common.pdfFilename;
const PORT = process.env.PDF_PORT || "3939";
const URL = `http://127.0.0.1:${PORT}/`;

const publicDir = resolve(root, "public");
if (!existsSync(publicDir)) mkdirSync(publicDir, { recursive: true });
const outPath = resolve(publicDir, PDF_FILENAME);

let nextProc;
let exitCode = 0;

async function waitForServer(url, timeoutMs = 30000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const r = await fetch(url, { method: "HEAD" });
      if (r.ok || r.status === 304) return;
    } catch (_) {}
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`Timed out waiting for ${url}`);
}

try {
  let chromium;
  try {
    ({ chromium } = await import("playwright"));
  } catch (_) {
    ({ chromium } = await import("@playwright/test"));
  }

  console.log(`→ Starting Next on port ${PORT}…`);
  nextProc = spawn("npx", ["next", "start", "-p", PORT], {
    cwd: root,
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, TZ: "UTC" },
  });
  nextProc.stdout.on("data", () => {});
  nextProc.stderr.on("data", (d) => process.stderr.write(d));

  await waitForServer(URL);
  console.log(`→ Server ready at ${URL}`);

  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    locale: "en-US",
    timezoneId: "UTC",
  });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts && document.fonts.ready);
  await page.evaluate(() => {
    document.querySelectorAll(".fade-in").forEach((el) => el.classList.add("visible"));
    document.querySelectorAll("details.detail-drawer").forEach((el) => el.setAttribute("open", "true"));
  });
  await page.waitForTimeout(1500);

  console.log(`→ Writing ${outPath}…`);
  await page.pdf({
    path: outPath,
    format: "Letter",
    printBackground: true,
    margin: { top: "0.5in", bottom: "0.5in", left: "0.5in", right: "0.5in" },
    preferCSSPageSize: true,
  });

  await browser.close();
  console.log(`✓ PDF written to public/${PDF_FILENAME}`);
} catch (err) {
  console.error("✗ PDF build failed:", err.message);
  exitCode = 1;
} finally {
  if (nextProc && !nextProc.killed) {
    nextProc.kill("SIGTERM");
    await new Promise((r) => setTimeout(r, 200));
    if (!nextProc.killed) nextProc.kill("SIGKILL");
  }
  process.exit(exitCode);
}
