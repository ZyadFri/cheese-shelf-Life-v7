# Shelf-Life Studio presentation demos

Two presentation-ready MP4s recorded from the real, running application
(FastAPI backend on :8010, Next.js frontend on :3000) via Playwright.
Nothing shown is fabricated: every metric, chart, prediction, classification
result, and ingredient ranking is a live response from the real backend, and
the AI assistant answer is a real Gemini response.

## Output

- `output/presentation_video_1_models_explainability_ai.mp4` -- Home -> Modeling -> Explainability -> Ask Shelf-Life AI
- `output/presentation_video_2_prediction_classification_ranking.mp4` -- Prediction -> Classification -> Ingredient Ranking

Both: 1920x1080, H.264/yuv420p, 30fps, ~70s, no audio.

## How they were built

1. **`warmup.mjs`** (not recorded) -- signs up a demo account, logs in, and
   runs one real V6 prediction (Edam / semi-hard / potassium sorbate) through
   the actual wizard so Video 1's Explainability "local explanation" panel
   has a genuine prediction to explain (it reads a localStorage history that
   would otherwise be empty). Saves a Playwright `storageState` to `auth/state.json`
   that both recordings reuse. Re-run this before recording if the session
   has been idle a while -- the app auto-logs-out idle sessions after ~30 min
   client-side, which is what caused a couple of mid-development failures.
2. **`prewarm.mjs`** (not recorded) -- visits every route used by both videos
   once. Next.js dev mode (Turbopack) compiles each route's bundle lazily on
   first visit, which cost 20-25s of dead air the first time each page was
   hit; pre-warming eliminates that entirely.
3. **`record_video_1.mjs`** -- records Video 1 end-to-end in one Playwright
   session -> `output/video1_raw.webm`.
4. **`record_video_2a_prediction.mjs`**, **`record_video_2b_classification.mjs`**,
   **`record_video_2c_ingredients.mjs`** -- Video 2 is recorded as three
   independent sessions, each starting fresh at its own route, then
   concatenated (`ffmpeg -f concat`) into one clip. See "Known app issue"
   below for why.
5. **`convert.mjs`** -- converts a raw WebM into the final MP4, applying a
   uniform speed multiplier so the real (but dev-server-slowed) raw capture
   lands in the ~70s target window. See "Why a uniform speed-up" below.

Final commands actually run for this delivery:

```bash
node warmup.mjs
node prewarm.mjs
node record_video_1.mjs
node convert.mjs output/video1_raw.webm output/presentation_video_1_models_explainability_ai.mp4 70

node warmup.mjs   # refresh session
node record_video_2a_prediction.mjs
node record_video_2b_classification.mjs
node record_video_2c_ingredients.mjs
printf "file 'video2a_raw.webm'\nfile 'video2b_raw.webm'\nfile 'video2c_raw.webm'\n" > output/concat_list.txt
ffmpeg -f concat -safe 0 -i output/concat_list.txt -c copy output/video2_raw_concat.webm
node convert.mjs output/video2_raw_concat.webm output/presentation_video_2_prediction_classification_ranking.mp4 70
```

## Why a uniform speed-up instead of trimming

The target app runs on `next dev` (Turbopack) plus a Python/uvicorn backend,
both sharing the machine with the Chromium recording session. Real network/
render latency under that combined load -- not anything artificial -- made
raw captures run 200s+ despite deliberate on-page pacing summing to far
less. Frame-accurate dead-time excision was attempted first (marking the
start/duration of every intentional pause and cutting everything else) but
produced choppier, less watchable results under time pressure than a single
clean, proportional speed-up, which keeps all relative timing/motion smooth
and was fast to validate. The result is watched-and-confirmed smooth, not
jittery -- see the frame checks below.

## Known app issue found while recording (for the app team, not fixed here)

On `/app/classification/run`, changing the "Ingredient" `<Select>` inside the
first formulation card (which lives inside a `framer-motion` animated
wrapper) leaves Base UI's popup backdrop (`[data-base-ui-inert]`, a
full-screen presentation div) permanently mounted and blocking all
subsequent clicks on the page. Reproduced consistently; survives Escape, a
real outside click, and even direct DOM removal (React re-mounts it).
Because of this, Video 2's classification section shows the form's own
default ingredient (real, valid, just not manually reselected) instead of
Potassium Sorbate. Nothing else on the page is affected -- the same
ingredient-select interaction works fine on `/app/prediction`, which does
not wrap the field in a motion component.

## Validation performed

- `ffprobe`: both outputs confirmed 1920x1080, h264, yuv420p, 30fps, ~70s.
- Frame extraction at multiple timestamps per video, visually inspected:
  real McGill branding, real charts/numbers, no browser chrome, no
  loading/blank frames, cursor indicator visible and unobtrusive, AI
  assistant panel shows a real "Gemini - Cloud AI" response.
- No credentials, API keys, or tokens visible on-screen (auth is via
  httpOnly session cookie, never rendered in the UI other than the signed-in
  user's own name/email in the sidebar footer).
