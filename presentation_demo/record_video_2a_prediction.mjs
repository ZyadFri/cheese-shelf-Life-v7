// VIDEO 2, PART A -- Prediction workflow (Cheddar / shredded / potassium
// sorbate). Starts fresh at /app/prediction. Real app, real data.
import {
  launchRecorder, sleep, humanClick, smoothScrollElementIntoView,
  finalizeRecording, BASE_URL,
} from "./helpers.mjs";

async function main() {
  const { browser, context, page } = await launchRecorder({ videoName: "video2a", useAuthState: true });

  await page.goto(`${BASE_URL}/app/prediction`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector('input[placeholder="Search cheeses by name…"]', { timeout: 20000 });
  await sleep(900);

  const searchInput = page.locator('input[placeholder="Search cheeses by name…"]');
  await searchInput.click();
  await searchInput.pressSequentially("cheddar", { delay: 55 });
  await sleep(700);
  await humanClick(page, page.getByRole("button", { name: /cheddar/i }).first(), { pauseAfter: 600 });

  await page.waitForSelector("text=How is your", { timeout: 15000 });
  await sleep(500);
  const shreddedCard = page.getByRole("button", { name: /shredded/i }).first();
  if (await shreddedCard.count()) {
    await humanClick(page, shreddedCard, { pauseAfter: 600 });
  } else {
    await humanClick(page, page.locator("button.group.overflow-hidden.rounded-\\[18px\\]").first(), { pauseAfter: 600 });
  }

  await page.waitForSelector("text=Review product profile", { timeout: 15000 });
  await sleep(1200);
  await humanClick(page, page.getByRole("button", { name: /continue/i }), { pauseAfter: 800 });

  await page.waitForSelector("text=Cheese composition", { timeout: 15000 });
  await sleep(600);
  const storageSection = page.getByRole("heading", { name: "Storage & packaging", exact: true });
  await smoothScrollElementIntoView(page, storageSection, { extraSettle: 700 });
  await sleep(1400);

  const endpointSection = page.getByRole("heading", { name: "Prediction endpoint", exact: true });
  await smoothScrollElementIntoView(page, endpointSection, { extraSettle: 600 });
  await sleep(1200);

  const treatmentSection = page.getByRole("heading", { name: "Preservation treatment", exact: true });
  await smoothScrollElementIntoView(page, treatmentSection, { extraSettle: 600 });
  await sleep(600);

  const ingredientTrigger = page.locator('section:has-text("Preservation treatment") [data-slot="select-trigger"]').first();
  await humanClick(page, ingredientTrigger, { pauseAfter: 400 });
  await humanClick(page, page.getByRole("option", { name: "potassium sorbate", exact: true }), { pauseAfter: 400 });
  await page.keyboard.press("Escape").catch(() => {});
  await sleep(400);

  const contextPanel = page.getByText("Prediction context", { exact: true });
  await smoothScrollElementIntoView(page, contextPanel, { extraSettle: 500 });
  await sleep(1400);

  const generateBtn = page.getByRole("button", { name: /generate prediction/i });
  await generateBtn.click({ force: true, timeout: 10000 }).catch(async () => {
    await page.keyboard.press("Escape").catch(() => {});
    await sleep(400);
    await humanClick(page, generateBtn, { pauseAfter: 400 });
  });
  await sleep(400);
  await page.waitForSelector("text=Predicted shelf life", { timeout: 30000 });
  await sleep(1000);

  await sleep(3200);

  const untreatedCard = page.getByText("Untreated baseline", { exact: true });
  if (await untreatedCard.count()) {
    await smoothScrollElementIntoView(page, untreatedCard, { extraSettle: 600 });
    await sleep(2600);
  }

  const metaRow = page.getByText("Cheese profile", { exact: true });
  if (await metaRow.count()) {
    await smoothScrollElementIntoView(page, metaRow, { extraSettle: 500 });
    await sleep(1600);
  }

  const explainHeading = page.getByRole("heading", { name: "What influenced this prediction?", exact: true });
  if (await explainHeading.count()) {
    await smoothScrollElementIntoView(page, explainHeading, { extraSettle: 700 });
    await sleep(3200);

    const topFactors = page.getByRole("heading", { name: "Top factors, with your inputs", exact: true });
    if (await topFactors.count()) {
      await smoothScrollElementIntoView(page, topFactors, { extraSettle: 600 });
      await sleep(2200);
    }
  }

  await finalizeRecording(context, page, "video2a_raw.webm");
  await browser.close();
  console.log("Video 2a (prediction) raw recording saved.");
}

main().catch((err) => {
  console.error("Video 2a recording failed:", err);
  process.exit(1);
});
