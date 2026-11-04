/**
 * Prefixes an asset path with the app's base URL.
 *
 *   withBase("/",      "/logo.svg") -> "/logo.svg"
 *   withBase("/repo/", "/logo.svg") -> "/repo/logo.svg"
 *   withBase("./",     "/logo.svg") -> "./logo.svg"
 *   withBase("https://cdn.example.com/a/", "/logo.svg")
 *                                    -> "https://cdn.example.com/a/logo.svg"
 *
 * Pure and free of Node imports, so it is safe to bundle for the browser.
 */
export function withBase(base: string, path: string): string {
  const prefix = base.replace(/\/+$/, "");
  return `${prefix}${path.startsWith("/") ? path : `/${path}`}`;
}
