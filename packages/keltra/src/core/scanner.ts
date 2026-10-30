import { existsSync } from "node:fs";
import { extname, relative, resolve } from "node:path";
import { glob } from "tinyglobby";
import type { ResolvedConfig, ScannedAsset } from "./types";

function toPosix(file: string): string {
  return file.replaceAll("\\", "/");
}

function buildPattern(extensions: string[]): string {
  const [first] = extensions;
  return extensions.length === 1 && first
    ? `**/*.${first}`
    : `**/*.{${extensions.join(",")}}`;
}

/**
 * Finds every asset in the configured folders and returns them sorted,
 * so the generated output is stable between runs.
 */
export async function scanAssets(
  config: ResolvedConfig,
): Promise<ScannedAsset[]> {
  if (config.extensions.length === 0) return [];

  const pattern = buildPattern(config.extensions);
  const found = new Map<string, ScannedAsset>();

  for (const { dir, prefix } of config.dirs) {
    const cwd = resolve(config.root, dir);
    if (!existsSync(cwd)) continue; // folder may not exist yet

    const files = await glob(pattern, {
      cwd,
      ignore: config.ignore,
      onlyFiles: true,
      caseSensitiveMatch: false,
    });

    for (const file of files) {
      const path = `${prefix}/${toPosix(file)}`;
      if (found.has(path)) continue; // first folder wins on conflicts

      found.set(path, {
        path,
        file: toPosix(relative(config.root, resolve(cwd, file))),
        ext: extname(file).slice(1).toLowerCase(),
      });
    }
  }

  return [...found.values()].sort((a, b) =>
    a.path < b.path ? -1 : a.path > b.path ? 1 : 0,
  );
}
