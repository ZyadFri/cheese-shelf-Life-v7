// Converts a raw Playwright WebM screen recording into a presentation-ready
// MP4/H.264 1920x1080 file, normalizing its duration into the ~50-75s target
// via a uniform speed multiplier (see README.md for why a uniform speed-up
// was used instead of frame-accurate dead-time trimming).
//
// Usage: node convert.mjs <input.webm> <output.mp4> [targetSeconds=70]
import { execFileSync } from "node:child_process";

const [, , input, output, targetSecondsArg] = process.argv;
if (!input || !output) {
  console.error("Usage: node convert.mjs <input.webm> <output.mp4> [targetSeconds=70]");
  process.exit(1);
}
const targetSeconds = Number(targetSecondsArg ?? 70);

const duration = Number(
  execFileSync("ffprobe", [
    "-v", "error", "-show_entries", "format=duration",
    "-of", "default=noprint_wrappers=1:nokey=1", input,
  ]).toString().trim(),
);

const factor = Math.max(1, duration / targetSeconds);
console.log(`Input duration: ${duration.toFixed(1)}s -> speed factor ${factor.toFixed(3)} -> target ~${targetSeconds}s`);

execFileSync("ffmpeg", [
  "-y", "-i", input,
  "-vf", `setpts=PTS/${factor.toFixed(4)},scale=1920:1080:flags=lanczos`,
  "-r", "30",
  "-c:v", "libx264", "-profile:v", "high", "-pix_fmt", "yuv420p",
  "-crf", "18", "-preset", "medium", "-an",
  output,
], { stdio: "inherit" });

console.log("Wrote", output);
