import { resolve } from "node:path";
import type { KeltraConfig, ResolvedConfig, ResolvedDir } from "./types";

export const DEFAULT_EXTENSIONS = [
  // images
  "png",
  "jpg",
  "jpeg",
  "gif",
  "webp",
  "avif",
  "svg",
  "ico",
  // video and audio
  "mp4",
  "webm",
  "mp3",
  "wav",
  "ogg",
  // fonts and documents
  "woff",
  "woff2",
  "ttf",
  "otf",
  "pdf",
];

export const DEFAULT_IGNORE = ["**/node_modules/**"];

/** Identity helper so config files get autocomplete. */
export function defineConfig(config: KeltraConfig): KeltraConfig {
  return config;
}

/** "/", "" -> ""   "images/" -> "/images"   "/a/b/" -> "/a/b" */
function normalizePrefix(prefix: string | undefined): string {
  const trimmed = (prefix ?? "/").trim().replace(/^\/+|\/+$/g, "");
  return trimmed === "" ? "" : `/${trimmed}`;
}

export function resolveConfig(
  user: KeltraConfig = {},
  root: string = process.cwd(),
): ResolvedConfig {
  const dirs: ResolvedDir[] = (user.dirs ?? ["public"]).map((entry) =>
    typeof entry === "string"
      ? { dir: entry, prefix: "" }
      : { dir: entry.dir, prefix: normalizePrefix(entry.prefix) },
  );

  return {
    root: resolve(root),
    dirs,
    extensions: (user.extensions ?? DEFAULT_EXTENSIONS).map((ext) =>
      ext.replace(/^\./, "").toLowerCase(),
    ),
    ignore: user.ignore ?? DEFAULT_IGNORE,
    outDir: user.outDir ?? ".keltra",
  };
}