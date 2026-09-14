// NOT part of the recorded videos. Next.js dev server (Turbopack) compiles
// each route's page bundle lazily on first visit, which caused 20-25s
// stalls mid-recording. This visits every route used by both videos once,
// authenticated, so they're already compiled and instant when we record.
import { chromium } from "playwright";
import { BASE_URL, AUTH_STATE_PATH, sleep } from "./helpers.mjs";

const ROUTES = [
  "/app",
  "/app/modeling",
  "/app/explainability",
  "/app/prediction",
  "/app/classification",
  "/app/classification/run",
  "/app/ingredients",
];

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 }, storageState: AUTH_STATE_PATH });
  const page = await context.newPage();

  for (const route of ROUTES) {
    const t0 = Date.now();
    await page.goto(`${BASE_URL}${route}`, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForLoadState("networkidle", { timeout: 30000 }).catch(() => {});
    await sleep(300);
    console.log(route, "compiled in", Date.now() - t0, "ms");
  }

  await browser.close();
  console.log("Pre-warm complete.");
}

main().catch((err) => {
  console.error("Pre-warm failed:", err);
  process.exit(1);
});
