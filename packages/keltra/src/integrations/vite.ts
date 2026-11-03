import type { Plugin, ResolvedConfig } from "vite";
import {
  type AssetWatcher,
  createKeltra,
  type Keltra,
  type KeltraConfig,
} from "../core";
import { loadConfig } from "../core/load-config";

const plural = (count: number, word: string) =>
  `${count} ${word}${count === 1 ? "" : "s"}`;

/**
 * keltra for Vite.
 *
 * Options are merged over `keltra.config.ts`. Prefer the config file: the
 * CLI (`keltra generate`) only reads the file, so keeping your settings
 * there means CI and the dev server always agree.
 *
 * @example
 * // vite.config.ts
 * import keltra from "keltra/vite";
 * export default defineConfig({ plugins: [keltra()] });
 */
export default function keltra(options: KeltraConfig = {}): Plugin {
  let instance: Keltra | undefined;
  let watcher: AssetWatcher | undefined;
  let logger: ResolvedConfig["logger"] | undefined;

  return {
    name: "keltra",

    async configResolved(config) {
      logger = config.logger;
      const fromFile = await loadConfig(config.root);
      instance = createKeltra({ ...fromFile, ...options }, config.root);
    },

    // Runs for `vite build` and when the dev server starts.
    async buildStart() {
      if (!instance) return;

      const { assets, changed } = await instance.generate();
      if (changed) {
        logger?.info(
          `[keltra] generated ${plural(assets.length, "asset path")}`,
          {
            timestamp: true,
          },
        );
      }
    },

    // Dev only: keep the manifest in sync while files are added or removed.
    configureServer() {
      if (!instance || watcher) return;

      watcher = instance.watch(({ assets }) => {
        logger?.info(
          `[keltra] manifest updated (${plural(assets.length, "asset path")})`,
          { timestamp: true },
        );
      });
    },

    // Called when the dev server closes (and at the end of a build).
    async buildEnd() {
      await watcher?.close();
      watcher = undefined;
    },
  };
}

export type { KeltraConfig as KeltraViteOptions };
