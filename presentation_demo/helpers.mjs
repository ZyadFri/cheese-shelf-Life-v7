// Shared recording helpers for the presentation demo videos.
// Real app, real backend, real data -- these helpers only control pacing,
// cursor visibility, and smooth scrolling for a clean recording; they never
// fabricate content.
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

export const BASE_URL = "http://localhost:3000";
// __dirname-equivalent for this module -- these scripts are always run
// with `node <script>.mjs` from inside presentation_demo/, but resolving
// relative to this file's own location is robust regardless of cwd.
const HERE = path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, "$1");
export const AUTH_STATE_PATH = path.join(HERE, "auth", "state.json");
export const OUTPUT_DIR = path.join(HERE, "output");

const VIEWPORT = { width: 1920, height: 1080 };

// Injected once per new document (addInitScript survives navigations).
// Hides scrollbars and draws a small elegant pointer dot that follows the
// real mouse position, with a soft ring pulse on click -- purely cosmetic,
// for presentation clarity, never altering the app's own UI.
const CURSOR_AND_SCROLLBAR_CSS_JS = `
(function () {
  function install() {
    var style = document.createElement("style");
    style.textContent = [
      "* { scrollbar-width: none !important; }",
      "*::-webkit-scrollbar { display: none !important; width: 0 !important; height: 0 !important; }",
      "html { scroll-behavior: smooth; }",
      "#__demo_cursor_dot { position: fixed; width: 14px; height: 14px; border-radius: 50%;",
      "  background: rgba(146,29,63,0.92); border: 2px solid rgba(255,255,255,0.95);",
      "  box-shadow: 0 2px 10px rgba(0,0,0,0.35); pointer-events: none; z-index: 2147483647;",
      "  transform: translate(-50%, -50%); left: -100px; top: -100px; transition: left 0.03s linear, top 0.03s linear; }",
      "#__demo_cursor_ring { position: fixed; width: 14px; height: 14px; border-radius: 50%;",
      "  border: 2px solid rgba(146,29,63,0.75); pointer-events: none; z-index: 2147483646;",
      "  transform: translate(-50%, -50%) scale(1); left: -100px; top: -100px; opacity: 0; }",
      "@keyframes __demo_ring_pulse { 0% { opacity: 0.9; transform: translate(-50%, -50%) scale(1); }",
      "  100% { opacity: 0; transform: translate(-50%, -50%) scale(2.6); } }",
      ".__demo_ring_pulse { animation: __demo_ring_pulse 0.55s ease-out forwards; }",
    ].join("\\n");
    document.head.appendChild(style);

    var dot = document.createElement("div");
    dot.id = "__demo_cursor_dot";
    var ring = document.createElement("div");
    ring.id = "__demo_cursor_ring";
    document.documentElement.appendChild(dot);
    document.documentElement.appendChild(ring);

    window.addEventListener("mousemove", function (e) {
      dot.style.left = e.clientX + "px";
      dot.style.top = e.clientY + "px";
      ring.style.left = e.clientX + "px";
      ring.style.top = e.clientY + "px";
    }, { passive: true });

    window.addEventListener("mousedown", function (e) {
      ring.style.left = e.clientX + "px";
      ring.style.top = e.clientY + "px";
      ring.classList.remove("__demo_ring_pulse");
      void ring.offsetWidth;
      ring.classList.add("__demo_ring_pulse");
    }, { passive: true });
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", install);
  } else {
    install();
  }
})();
`;

export async function launchRecorder({ videoName, useAuthState = true }) {
  const browser = await chromium.launch({ headless: true });
  const contextOptions = {
    viewport: VIEWPORT,
    recordVideo: { dir: OUTPUT_DIR, size: VIEWPORT },
    deviceScaleFactor: 1,
  };
  if (useAuthState && fs.existsSync(AUTH_STATE_PATH)) {
    contextOptions.storageState = AUTH_STATE_PATH;
  }
  const context = await browser.newContext(contextOptions);
  await context.addInitScript(CURSOR_AND_SCROLLBAR_CSS_JS);
  const page = await context.newPage();
  return { browser, context, page };
}

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Move the real mouse to an element (so our cosmetic cursor dot tracks it),
 * pause briefly as if a presenter is aiming, then click. */
export async function humanClick(page, locator, { pauseBefore = 260, pauseAfter = 220 } = {}) {
  await locator.scrollIntoViewIfNeeded();
  const box = await locator.boundingBox();
  if (box) {
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 18 });
  }
  await sleep(pauseBefore);
  await locator.click();
  await sleep(pauseAfter);
}

/** Smooth, moderate-speed scroll of the whole page by a pixel amount. */
export async function smoothScrollBy(page, deltaY, { steps = 10, stepDelay = 45 } = {}) {
  const perStep = deltaY / steps;
  for (let i = 0; i < steps; i++) {
    await page.mouse.wheel(0, perStep);
    await sleep(stepDelay);
  }
}

/** Smoothly scroll a specific element/section into the vertical center of the viewport. */
export async function smoothScrollElementIntoView(page, locator, { extraSettle = 500 } = {}) {
  await locator.evaluate((el) => el.scrollIntoView({ behavior: "smooth", block: "center" }));
  await sleep(extraSettle);
}

export async function typeNaturally(page, locator, text, { perCharDelay = 38 } = {}) {
  await locator.click();
  await locator.pressSequentially(text, { delay: perCharDelay });
}

/** Finalizes a context's video: closes the page/context (which flushes the
 * webm to disk), renames it to a predictable path, and returns that path. */
export async function finalizeRecording(context, page, finalWebmName) {
  const video = page.video();
  await context.close();
  const recordedPath = await video.path();
  const targetPath = path.join(OUTPUT_DIR, finalWebmName);
  if (recordedPath !== targetPath) {
    fs.renameSync(recordedPath, targetPath);
  }
  return targetPath;
}
