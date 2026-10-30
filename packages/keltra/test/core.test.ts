import { afterEach, beforeEach, expect, test } from "bun:test";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createKeltra } from "../src/core";

let root: string;

beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), "keltra-"));
  await mkdir(join(root, "public/images"), { recursive: true });
  await writeFile(join(root, "public/images/hero.png"), "");
  await writeFile(join(root, "public/logo.svg"), "");
  await writeFile(join(root, "public/notes.txt"), ""); // not an asset
});

afterEach(async () => {
  await rm(root, { recursive: true, force: true });
});

test("scans assets and writes typed manifest", async () => {
  const keltra = createKeltra({}, root);
  const result = await keltra.generate();

  expect(result.assets.map((a) => a.path)).toEqual([
    "/images/hero.png",
    "/logo.svg",
  ]);

  const register = await readFile(join(root, ".keltra/register.d.ts"), "utf8");
  expect(register).toContain('paths: "/images/hero.png" | "/logo.svg"');
});

test("does not rewrite files when nothing changed", async () => {
  const keltra = createKeltra({}, root);
  expect((await keltra.generate()).changed).toBe(true);
  expect((await keltra.generate()).changed).toBe(false);
});

test("supports custom folders with a prefix", async () => {
  await mkdir(join(root, "src/assets"), { recursive: true });
  await writeFile(join(root, "src/assets/bg.webp"), "");

  const keltra = createKeltra(
    { dirs: [{ dir: "src/assets", prefix: "/assets" }] },
    root,
  );
  const result = await keltra.generate();

  expect(result.assets.map((a) => a.path)).toEqual(["/assets/bg.webp"]);
});

test("empty projects produce a never union", async () => {
  const keltra = createKeltra({ dirs: ["does-not-exist"] }, root);
  await keltra.generate();
  const register = await readFile(join(root, ".keltra/register.d.ts"), "utf8");
  expect(register).toContain("paths: never;");
});
