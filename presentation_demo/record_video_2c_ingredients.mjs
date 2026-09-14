// VIDEO 2, PART C -- Ingredient ranking. Starts fresh at /app/ingredients.
import {
  launchRecorder, sleep, humanClick, smoothScrollElementIntoView,
  finalizeRecording, BASE_URL,
} from "./helpers.mjs";

async function main() {
  const { browser, context, page } = await launchRecorder({ videoName: "video2c", useAuthState: true });

  await page.goto(`${BASE_URL}/app/ingredients`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("text=Ingredient efficacy landscape", { timeout: 20000 });
  await sleep(1400);
  await sleep(2200);

  const tableSearch = page.getByPlaceholder("Search ingredient or family…");
  await tableSearch.click();
  await tableSearch.pressSequentially("potassium sorbate", { delay: 45 });
  await sleep(1200);

  const psRow = page.locator("tr", { hasText: "Potassium Sorbate" }).first();
  await humanClick(page, psRow, { pauseBefore: 400, pauseAfter: 700 });

  await page.waitForSelector("text=Potassium Sorbate", { timeout: 10000 }).catch(() => {});
  await sleep(4000);

  await finalizeRecording(context, page, "video2c_raw.webm");
  await browser.close();
  console.log("Video 2c (ingredients) raw recording saved.");
}

main().catch((err) => {
  console.error("Video 2c recording failed:", err);
  process.exit(1);
});
