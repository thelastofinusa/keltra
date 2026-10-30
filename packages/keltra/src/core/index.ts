import { resolveConfig } from "./config";
import { generate } from "./generate";
import type { GenerateResult, KeltraConfig, ResolvedConfig } from "./types";
import type { AssetWatcher } from "./watcher";
import { watchAssets } from "./watcher";

export { defineConfig, resolveConfig } from "./config";
export { generate, renderManifest } from "./generate";
export { scanAssets } from "./scanner";
export type * from "./types";
export type { AssetWatcher } from "./watcher";
export { watchAssets } from "./watcher";

export interface Keltra {
  config: ResolvedConfig;
  /** Scan and write the manifest once. */
  generate(): Promise<GenerateResult>;
  /** Watch the asset folders and regenerate on changes. */
  watch(onGenerate?: (result: GenerateResult) => void): AssetWatcher;
}

/**
 * The one object every integration (Vite, Next, CLI...) uses:
 *   const keltra = createKeltra(userConfig, root);
 *   await keltra.generate();
 *   keltra.watch();
 */
export function createKeltra(
  userConfig: KeltraConfig = {},
  root: string = process.cwd(),
): Keltra {
  const config = resolveConfig(userConfig, root);
  return {
    config,
    generate: () => generate(config),
    watch: (onGenerate) => watchAssets(config, onGenerate),
  };
}
