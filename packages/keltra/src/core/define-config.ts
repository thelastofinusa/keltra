import type { KeltraConfig } from "./types";

/**
 * Identity helper so config files get autocomplete.
 *
 * This lives in its own file, with no Node imports, on purpose: the root
 * "keltra" entry is also imported by app code (for `assetPath`), so it must
 * stay safe to bundle for the browser.
 */
export function defineConfig(config: KeltraConfig): KeltraConfig {
  return config;
}
