export { defineConfig } from "./core/define-config";
export type { AssetDir, KeltraConfig } from "./core/types";

/**
 * Filled in by the generated `.keltra/register.d.ts`, which adds a `paths`
 * union of every asset in your project. Until you run the dev server
 * (or `keltra generate`), paths fall back to plain `string`.
 */
// biome-ignore lint/suspicious/noEmptyInterface: disable-no-empty-object-type
export interface Register {}

/** Union of every asset path in your project, e.g. "/images/hero.png". */
export type AssetPath = Register extends { paths: infer P extends string }
  ? P
  : string;

/**
 * Type-safe asset path. Autocompletes from your asset folders and
 * errors at compile time if the file doesn't exist.
 *
 * TODO: apply the framework's base path (Vite `base`, Next `basePath`)
 * once the integrations expose it.
 */
export function assetPath<P extends AssetPath>(path: P): P {
  return path;
}
