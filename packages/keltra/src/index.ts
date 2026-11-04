import { withBase } from "./core/with-base";

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
 * The app's base URL. Vite replaces `import.meta.env.BASE_URL` at build time
 * with the configured `base`, so this also works inside server renders.
 *
 * TODO: Next.js `basePath` will be injected by `withKeltra`.
 */
function getBase(): string {
  return (
    (import.meta as unknown as { env?: { BASE_URL?: string } }).env?.BASE_URL ??
    ""
  );
}

/**
 * Type-safe asset path. Autocompletes from your asset folders and errors at
 * compile time if the file doesn't exist. The app's base path is applied, so
 * it keeps working when the site is served from a sub-path.
 */
export function assetPath<P extends AssetPath>(path: P): string {
  return withBase(getBase(), path);
}
