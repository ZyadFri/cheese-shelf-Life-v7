// VIDEO 2, PART B -- Classification. Starts fresh at /app/classification.
import {
  launchRecorder, sleep, humanClick, smoothScrollElementIntoView,
  finalizeRecording, BASE_URL,
} from "./helpers.mjs";

async function main() {
  const { browser, context, page } = await launchRecorder({ videoName: "video2b", useAuthState: true });
  page.on("response", (r) => {
    if (r.url().includes("/api/")) console.log("RESP", r.status(), r.url());
  });
  page.on("console", (m) => { if (m.type() === "error") console.log("PAGE-ERROR:", m.text()); });

  await page.goto(`${BASE_URL}/app/classification`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("text=Classification", { timeout: 20000 });
  await sleep(1200);

  const classifyCta = page.getByRole("link", { name: /classify a formulation/i }).first();
  await humanClick(page, classifyCta, { pauseAfter: 600 });
  await page.waitForURL(/\/app\/classification\/run/, { timeout: 15000 });
  await page.waitForSelector("text=Cheese & storage conditions", { timeout: 20000 });
  await sleep(1000);

  const cheeseSection = page.locator('[data-slot="card-title"]', { hasText: "Cheese & storage conditions" });
  await smoothScrollElementIntoView(page, cheeseSection, { extraSettle: 600 });
  await sleep(1400);

  const treatmentHeading = page.locator('[data-slot="card-title"]', { hasText: "Treatment / preservation strategy" });
  await smoothScrollElementIntoView(page, treatmentHeading, { extraSettle: 600 });
  await sleep(700);

  // The formulation card's Ingredient <Select> lives inside a framer-motion
  // animated wrapper on this page; opening/closing it here leaves Base UI's
  // popup backdrop permanently stuck (reproduced consistently, survives
  // Escape, outside clicks, and direct DOM removal -- a real interaction
  // between the portal's position logic and the motion ancestor's
  // transform). Rather than fight that, show the form with its own real,
  // already-valid default ingredient/treatment values -- still a genuine,
  // fully supported formulation, just not a manually reselected one.
  const formulationCard = page.locator(".rounded-lg.border", { hasText: "Formulation 1" }).first();
  await smoothScrollElementIntoView(page, formulationCard, { extraSettle: 600 });
  await sleep(1600);

  const reviewHeading = page.locator('[data-slot="card-title"]', { hasText: "Review formulation" });
  await smoothScrollElementIntoView(page, reviewHeading, { extraSettle: 600 });
  await humanClick(page, reviewHeading, { pauseBefore: 200, pauseAfter: 300 });
  await sleep(700);

  // Deliberately NOT force-clicking: a forced click bypasses Playwright's
  // "is anything on top of this element" check, so if a stale popup overlay
  // is still technically present it would silently intercept the click
  // instead of reaching the real button -- no error, just nothing happens.
  // A normal click auto-retries until the overlay is truly gone.
  const classifyBtn = page.getByRole("button", { name: /classify formulation/i });
  await humanClick(page, classifyBtn, { pauseBefore: 300, pauseAfter: 600 });
  await page.waitForSelector("text=Classification results", { timeout: 45000 });
  await sleep(1000);

  const resultHeading = page.getByText("Classification results", { exact: true });
  await smoothScrollElementIntoView(page, resultHeading, { extraSettle: 700 });
  await sleep(3400);

  const modelScores = page.getByText("Model scores", { exact: true }).first();
  if (await modelScores.count()) {
    await smoothScrollElementIntoView(page, modelScores, { extraSettle: 500 });
    await sleep(2600);
  }

  await finalizeRecording(context, page, "video2b_raw.webm");
  await browser.close();
  console.log("Video 2b (classification) raw recording saved.");
}

main().catch((err) => {
  console.error("Video 2b recording failed:", err);
  process.exit(1);
});
