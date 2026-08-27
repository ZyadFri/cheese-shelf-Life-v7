import { access, copyFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const source = path.resolve(scriptDir, "../../App_Demo.mp4");
const destination = path.resolve(scriptDir, "../public/App_Demo.mp4");

try {
  await access(source);
  await copyFile(source, destination);
  console.log("Prepared App_Demo.mp4 for the Next.js public directory.");
} catch (error) {
  console.warn(
    "App_Demo.mp4 could not be prepared:",
    error instanceof Error ? error.message : error,
  );
}
