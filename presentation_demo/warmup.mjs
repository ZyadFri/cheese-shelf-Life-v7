// NOT part of the recorded videos. This creates a real demo account, logs
// in, and runs ONE real V6 prediction (Edam, semi-hard, general shelf life,
// potassium sorbate treatment) through the actual guided wizard so that:
//   1. Video 1's Explainability "local explanation" panel has a genuine
//      prediction to explain (it reads localStorage prediction history --
//      it must not be empty when we record).
//   2. The account/session is authenticated and reusable across both
//      recording sessions via a saved Playwright storageState file.
// This is real interaction with the real app/backend -- nothing here is
// fabricated; it is simply not shown in the final videos.
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { BASE_URL, AUTH_STATE_PATH, sleep, humanClick } from "./helpers.mjs";

const EMAIL = `droptask23+shelflife-demo${Date.now()}@gmail.com`;
const PASSWORD = "Presentation-Demo-2026!";
const NAME = "Demo Presenter";

async function main() {
  fs.mkdirSync(path.dirname(AUTH_STATE_PATH), { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();

  console.log("Signing up demo account:", EMAIL);
  await page.goto(`${BASE_URL}/signup`, { waitUntil: "networkidle" });
  await page.locator("#name").fill(NAME);
  await page.locator("#email").fill(EMAIL);
  await page.locator("#password").fill(PASSWORD);
  await page.locator("#confirm").fill(PASSWORD);
  await page.getByRole("button", { name: /create account/i }).click();
  await page.waitForURL(/\/app/, { timeout: 20000 });
  console.log("Signed up + logged in, at:", page.url());

  console.log("Navigating to prediction wizard...");
  await page.goto(`${BASE_URL}/app/prediction`, { waitUntil: "networkidle" });

  // Step 1: search + select cheese (Edam -- semi-hard, moderate support).
  await page.locator('input[placeholder="Search cheeses by name…"]').fill("edam");
  await sleep(500);
  await page.getByRole("button", { name: /edam/i }).first().click();
  await sleep(500);

  // Step 2: physical form -- pick the first offered card.
  await page.waitForSelector("text=How is your edam presented?", { timeout: 15000 });
  const formCards = page.locator("button.group.overflow-hidden.rounded-\\[18px\\]");
  await formCards.first().click();
  await sleep(500);

  // Step 3: profile confirmation -> Continue.
  await page.waitForSelector("text=Review product profile", { timeout: 15000 });
  await page.getByRole("button", { name: /continue/i }).click();
  await sleep(800);

  // Step 4: conditions -- select a real treatment ingredient (potassium
  // sorbate). Everything else is already auto-filled from real backend
  // category medians by the app itself.
  await page.waitForSelector("text=Preservation treatment", { timeout: 15000 });
  const ingredientTrigger = page.locator('section:has-text("Preservation treatment") [data-slot="select-trigger"]').first();
  await ingredientTrigger.click();
  await sleep(300);
  await page.getByRole("option", { name: "potassium sorbate", exact: true }).click();
  await sleep(500);

  await page.getByRole("button", { name: /generate prediction/i }).click();
  await page.waitForSelector("text=Predicted shelf life", { timeout: 30000 });
  await sleep(1500);
  console.log("Warm-up prediction complete.");

  await context.storageState({ path: AUTH_STATE_PATH });
  console.log("Saved auth/storage state to", AUTH_STATE_PATH);

  await browser.close();
}

main().catch((err) => {
  console.error("Warm-up failed:", err);
  process.exit(1);
});
