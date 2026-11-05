import { afterEach, beforeEach, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { withKeltra } from "../src/integrations/next";

const BUILD = "phase-production-build";
const DEV = "phase-development-server";
const SERVER = "phase-production-server";
const context = { defaultConfig: {} };

const WATCHER_KEY = Symbol.for("keltra.next.watcher");
const globals = globalThis as Record<
  symbol,
  { close(): Promise<void> } | undefined
>;

let root: string;
let previousCwd: string;
const register = () => readFile(join(root, ".keltra/register.d.ts"), "utf8");

beforeEach(async () => {
  previousCwd = process.cwd();
  root = await mkdtemp(join(tmpdir(), "keltra-next-"));
  await mkdir(join(root, "public"), { recursive: true });
  await writeFile(join(root, "public/logo.svg"), "");
  process.chdir(root); // withKeltra works in the folder Next runs from
});

afterEach(async () => {
  await globals[WATCHER_KEY]?.close();
  globals[WATCHER_KEY] = undefined;
  process.chdir(previousCwd);
  await rm(root, { recursive: true, force: true });
});

test("generates the manifest on build and passes basePath to assetPath", async () => {
  const config = await withKeltra({ basePath: "/docs", env: { A: "1" } })(
    BUILD,
    context,
  );

  expect(await register()).toContain('paths: "/logo.svg"');
  expect(config.basePath).toBe("/docs");
  expect(config.env).toEqual({ A: "1", NEXT_PUBLIC_KELTRA_BASE: "/docs" });
});

test("base is an empty string without a basePath", async () => {
  const config = await withKeltra({})(BUILD, context);
  expect(config.env?.NEXT_PUBLIC_KELTRA_BASE).toBe("");
});

test("wraps a config function and keeps its result", async () => {
  const config = await withKeltra((phase) => ({
    basePath: "/from-fn",
    poweredByHeader: phase !== BUILD,
  }))(BUILD, context);

  expect(config.basePath).toBe("/from-fn");
  expect(config.poweredByHeader).toBe(false);
  expect(config.env?.NEXT_PUBLIC_KELTRA_BASE).toBe("/from-fn");
});

test("does not generate for next start, but still sets the base", async () => {
  const config = await withKeltra({ basePath: "/docs" })(SERVER, context);

  expect(existsSync(join(root, ".keltra"))).toBe(false);
  expect(config.env?.NEXT_PUBLIC_KELTRA_BASE).toBe("/docs");
});

test("options override keltra.config.ts", async () => {
  await mkdir(join(root, "assets"), { recursive: true });
  await writeFile(join(root, "assets/bg.png"), "");
  await writeFile(
    join(root, "keltra.config.ts"),
    'export default { dirs: ["assets"] };\n',
  );

  await withKeltra({}, { dirs: ["public"] })(BUILD, context);
  expect(await register()).toContain('paths: "/logo.svg"');
});

test("dev watches for new files", async () => {
  await withKeltra({})(DEV, context);
  await new Promise((resolve) => setTimeout(resolve, 300));
  await writeFile(join(root, "public/new.webp"), "");

  const deadline = Date.now() + 3000;
  let content = await register();
  while (!content.includes("/new.webp") && Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, 50));
    content = await register();
  }

  expect(content).toContain('"/logo.svg" | "/new.webp"');
});
