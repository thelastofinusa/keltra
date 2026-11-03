import { afterEach, beforeEach, expect, test } from "bun:test";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import keltra from "../src/integrations/vite";

// The plugin only uses plain function hooks, so tests can call them directly
// instead of starting a real Vite server.
type Hooks = {
  configResolved(config: unknown): Promise<void>;
  buildStart(): Promise<void>;
  configureServer(server: unknown): void;
  buildEnd(): Promise<void>;
};

const logger = { info() {} };
const hooks = (plugin: ReturnType<typeof keltra>) => plugin as unknown as Hooks;

let root: string;
const register = () => readFile(join(root, ".keltra/register.d.ts"), "utf8");

beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), "keltra-vite-"));
  await mkdir(join(root, "public"), { recursive: true });
  await writeFile(join(root, "public/logo.svg"), "");
});

afterEach(async () => {
  await rm(root, { recursive: true, force: true });
});

test("generates the manifest on buildStart", async () => {
  const plugin = hooks(keltra());
  await plugin.configResolved({ root, logger });
  await plugin.buildStart();

  expect(await register()).toContain('paths: "/logo.svg"');
});

test("reads folders from keltra.config.ts", async () => {
  await mkdir(join(root, "assets"), { recursive: true });
  await writeFile(join(root, "assets/bg.png"), "");
  await writeFile(
    join(root, "keltra.config.ts"),
    'export default { dirs: ["assets"] };\n',
  );

  const plugin = hooks(keltra());
  await plugin.configResolved({ root, logger });
  await plugin.buildStart();

  expect(await register()).toContain('paths: "/bg.png"');
});

test("plugin options override the config file", async () => {
  await mkdir(join(root, "assets"), { recursive: true });
  await writeFile(join(root, "assets/bg.png"), "");
  await writeFile(
    join(root, "keltra.config.ts"),
    'export default { dirs: ["assets"] };\n',
  );

  const plugin = hooks(keltra({ dirs: ["public"] }));
  await plugin.configResolved({ root, logger });
  await plugin.buildStart();

  expect(await register()).toContain('paths: "/logo.svg"');
});

test("regenerates when assets change in dev, and stops on buildEnd", async () => {
  const plugin = hooks(keltra());
  await plugin.configResolved({ root, logger });
  await plugin.buildStart();
  plugin.configureServer({});

  // give chokidar a moment to finish its initial scan
  await new Promise((resolve) => setTimeout(resolve, 300));
  await writeFile(join(root, "public/new.webp"), "");

  const deadline = Date.now() + 3000;
  let content = await register();
  while (!content.includes("/new.webp") && Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, 50));
    content = await register();
  }

  expect(content).toContain('"/logo.svg" | "/new.webp"');
  await plugin.buildEnd();
});
