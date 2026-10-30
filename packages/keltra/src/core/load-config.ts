import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { createJiti } from "jiti";
import type { KeltraConfig } from "./types";
import { pkg } from "../pkg.config";

export const CONFIG_FILES = [
  `${pkg.name}.config.ts`,
  `${pkg.name}.config.mts`,
  `${pkg.name}.config.js`,
  `${pkg.name}.config.mjs`,
];

/** Returns the absolute path of the project's keltra config, if there is one. */
export function findConfigFile(root: string = process.cwd()): string | undefined {
  for (const name of CONFIG_FILES) {
    const file = join(resolve(root), name);
    if (existsSync(file)) return file;
  }
  return undefined;
}

/**
 * Loads `keltra.config.{ts,mts,js,mjs}` from the project root.
 * TypeScript configs work without any extra setup. Returns `{}` when
 * the project has no config file.
 */
export async function loadConfig(
  root: string = process.cwd(),
): Promise<KeltraConfig> {
  const file = findConfigFile(root);
  if (!file) return {};

  const jiti = createJiti(import.meta.url);
  const config = await jiti.import<KeltraConfig | undefined>(file, {
    default: true,
  });

  return config ?? {};
}