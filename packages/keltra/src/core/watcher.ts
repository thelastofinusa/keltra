import { extname, resolve } from "node:path";
import { watch } from "chokidar";
import { generate } from "./generate";
import type { GenerateResult, ResolvedConfig } from "./types";

export interface AssetWatcher {
  close(): Promise<void>;
}

/**
 * Watches the asset folders and regenerates the manifest when files are
 * added, removed, or renamed. Edits to a file's contents are ignored,
 * since they can't change the types.
 */
export function watchAssets(
  config: ResolvedConfig,
  onGenerate?: (result: GenerateResult) => void,
): AssetWatcher {
  const dirs = config.dirs.map(({ dir }) => resolve(config.root, dir));
  const extensions = new Set(config.extensions.map((ext) => `.${ext}`));

  let timer: ReturnType<typeof setTimeout> | undefined;
  let running = false;
  let queued = false;

  async function run(): Promise<void> {
    if (running) {
      queued = true;
      return;
    }
    running = true;
    try {
      const result = await generate(config);
      if (result.changed) onGenerate?.(result);
    } catch (error) {
      console.error("[keltra] failed to regenerate manifest:", error);
    } finally {
      running = false;
      if (queued) {
        queued = false;
        void run();
      }
    }
  }

  function schedule(): void {
    clearTimeout(timer);
    timer = setTimeout(() => void run(), 50);
  }

  const watcher = watch(dirs, {
    ignoreInitial: true,
    ignored: (path) => path.includes("node_modules"),
  });

  watcher.on("all", (event, file) => {
    if (event === "add" || event === "unlink") {
      if (!extensions.has(extname(file).toLowerCase())) return;
      schedule();
    } else if (event === "addDir" || event === "unlinkDir") {
      schedule();
    }
  });

  return {
    async close() {
      clearTimeout(timer);
      await watcher.close();
    },
  };
}