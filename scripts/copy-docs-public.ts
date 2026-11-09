import * as fs from "node:fs";
import * as path from "node:path";

const source: string = path.join("apps", "docs", "public");

if (!fs.existsSync(source)) {
  console.error(`❌ Source not found: ${source}`);
  process.exit(0);
}

const targets: string[] = [
  "examples/next-app/public",
  "examples/vite-app/public",
];

targets.forEach((target: string): void => {
  const appDir = path.dirname(target);

  if (!fs.existsSync(appDir)) {
    console.log(`⏭️ Skipped: ${appDir}`);
    return;
  }

  try {
    fs.cpSync(source, target, { recursive: true, force: true });
    console.log(`✅ Copied: ${appDir}`);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`❌ Failed: ${appDir} (${msg})`);
  }
});
