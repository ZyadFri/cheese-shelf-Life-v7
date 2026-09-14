// VIDEO 1 -- Models, Explainability, AI Assistant.
// Real app (localhost:3000 / backend :8010), real data, real Gemini
// assistant response. No fabricated content. See helpers.mjs for cosmetic
// recording aids (cursor dot, scrollbar hiding, smooth scroll).
import {
  launchRecorder, sleep, humanClick, smoothScrollElementIntoView,
  typeNaturally, finalizeRecording, BASE_URL,
} from "./helpers.mjs";

async function main() {
  const { browser, context, page } = await launchRecorder({ videoName: "video1", useAuthState: true });

  // ---- A. Home: brief orientation shot ----------------------------------
  await page.goto(`${BASE_URL}/app`, { waitUntil: "networkidle" });
  await sleep(2600);

  const sidebar = page.locator("nav, aside").first();
  const modelingLink = page.getByRole("link", { name: "Modeling", exact: true });
  await humanClick(page, modelingLink, { pauseBefore: 300, pauseAfter: 400 });

  // ---- B. Modeling --------------------------------------------------------
  await page.waitForURL(/\/app\/modeling/);
  await page.waitForSelector("text=Best algorithm", { timeout: 20000 });
  await sleep(700);

  // Ensure Semi-hard / General shelf life is selected (it's a reasonable
  // default, but make the choice explicit and visible for the audience).
  await humanClick(page, page.getByRole("button", { name: "Semi-hard", exact: true }), { pauseAfter: 500 });
  await humanClick(page, page.getByRole("button", { name: "General shelf life", exact: true }), { pauseAfter: 700 });
  await page.waitForSelector("text=Best algorithm", { timeout: 20000 });
  await sleep(900);

  // Metric cards are already in view; pause so the audience can read them.
  await sleep(1400);

  // Model comparison table + validation/test RMSE chart.
  const comparisonHeading = page.getByRole("heading", { name: "Model comparison", exact: true }).first();
  await smoothScrollElementIntoView(page, comparisonHeading, { extraSettle: 700 });
  await sleep(2200);

  // Model diagnostics: scatter, importance, training curve -- for the best
  // model (LightGBM, already active by default), then switch to a second
  // algorithm to show the comparison is real and interactive.
  const diagnosticsHeading = page.getByRole("heading", { name: "Model diagnostics", exact: true }).first();
  await smoothScrollElementIntoView(page, diagnosticsHeading, { extraSettle: 700 });
  await sleep(2600);

  const xgboostTab = page.getByRole("tab", { name: "XGBoost", exact: true }).first();
  if (await xgboostTab.count()) {
    await humanClick(page, xgboostTab, { pauseAfter: 900 });
    await sleep(2400);
  }

  // Training run details footer.
  const runDetails = page.getByRole("heading", { name: "Training run details", exact: true }).first();
  await smoothScrollElementIntoView(page, runDetails, { extraSettle: 600 });
  await sleep(1600);

  // ---- D. Explainability ---------------------------------------------------
  const explainLink = page.getByRole("link", { name: "Explainability", exact: true });
  await smoothScrollElementIntoView(page, page.locator("body"), { extraSettle: 0 });
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  await sleep(500);
  await humanClick(page, explainLink, { pauseAfter: 500 });

  await page.waitForURL(/\/app\/explainability/);
  await page.waitForSelector("text=Global feature importance", { timeout: 20000 });
  await sleep(700);

  // Confirm same specialist focus as the Modeling section.
  const semiHardBtn2 = page.getByRole("button", { name: "Semi-hard", exact: true });
  if (await semiHardBtn2.count()) {
    const alreadyActive = await semiHardBtn2.evaluate((el) => el.className.includes("text-[#8e1839]"));
    if (!alreadyActive) await humanClick(page, semiHardBtn2, { pauseAfter: 500 });
  }
  await sleep(800);

  // Summary cards, then global feature importance panel.
  const importanceHeading = page.getByRole("heading", { name: "Global feature importance", exact: true }).first();
  await smoothScrollElementIntoView(page, importanceHeading, { extraSettle: 700 });
  await sleep(2600);

  // Local explanation for the real warmed-up prediction (Edam + potassium
  // sorbate) -- the same specialist that produced it.
  const localHeading = page.getByRole("heading", { name: "Local explanation for a formulation", exact: true }).first();
  await smoothScrollElementIntoView(page, localHeading, { extraSettle: 700 });
  await page.waitForSelector("text=How features push this prediction", { timeout: 15000 }).catch(() => {});
  await sleep(3400);

  // ---- E. AI Assistant -------------------------------------------------
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  await sleep(500);

  const assistantLauncher = page.getByRole("button", { name: /open ai assistant/i });
  await humanClick(page, assistantLauncher, { pauseBefore: 350, pauseAfter: 500 });

  const chatInput = page.getByPlaceholder("Ask a question…");
  await chatInput.waitFor({ state: "visible", timeout: 10000 });
  await sleep(500);

  const query = "For semi-hard cheese, which model is currently selected and which factors have the strongest influence on shelf-life prediction?";
  await typeNaturally(page, chatInput, query, { perCharDelay: 24 });
  await sleep(500);

  await page.getByRole("button", { name: "Send" }).click().catch(async () => {
    // Fallback: the submit button may only expose an icon (no accessible name).
    await page.locator('form button[type="submit"]').click();
  });

  // Wait for the real assistant response (Gemini, live) to finish streaming.
  await page.waitForSelector("text=Thinking…", { state: "visible", timeout: 8000 }).catch(() => {});
  await page.waitForSelector("text=Thinking…", { state: "detached", timeout: 45000 }).catch(() => {});
  await sleep(5000);

  await finalizeRecording(context, page, "video1_raw.webm");
  await browser.close();
  console.log("Video 1 raw recording saved.");
}

main().catch((err) => {
  console.error("Video 1 recording failed:", err);
  process.exit(1);
});
