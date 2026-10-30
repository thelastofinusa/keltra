import { resolveConfig } from "./config";
import { generate } from "./generate";
import { watchAssets } from "./watcher";
import type { AssetWatcher } from "./watcher";
import type { GenerateResult, KeltraConfig, ResolvedConfig } from "./types";

export { defineConfig, resolveConfig } from "./config";
export { generate, renderManifest } from "./generate";
export { scanAssets } from "./scanner";
export { watchAssets } from "./watcher";
export type { AssetWatcher } from "./watcher";
export type * from "./types";

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