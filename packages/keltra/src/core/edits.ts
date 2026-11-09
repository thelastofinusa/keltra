import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import {
  applyEdits,
  modify,
  type ParseError,
  parse as parseJsonc,
} from "jsonc-parser";
import type { Framework } from "../cli/core/project";

/** The glob every project needs in its tsconfig `include`. */
export const KELTRA_TYPES_GLOB = ".keltra/*.d.ts";

export type EditStatus = "added" | "already" | "skipped";

// ---------------------------------------------------------------------------
// tsconfig
// ---------------------------------------------------------------------------

/**
 * Pick the tsconfig that actually holds the app's `include`.
 * - Vite splits app code into tsconfig.app.json
 * - Everything else uses tsconfig.json
 */
export async function findTsConfigFile(
  root: string,
  framework: Framework,
): Promise<string | undefined> {
  if (framework === "vite") {
    const app = join(root, "tsconfig.app.json");
    if (existsSync(app)) return app;
  }
  const tsconfig = join(root, "tsconfig.json");
  return existsSync(tsconfig) ? tsconfig : undefined;
}

/** Adds `.keltra/*.d.ts` to the `include` array, preserving formatting. */
export async function addKeltraTypesToTsConfig(
  file: string,
): Promise<EditStatus> {
  const content = await readFile(file, "utf8");
  const errors: ParseError[] = [];
  const parsed = parseJsonc(content, errors, { allowTrailingComma: true });

  // jsonc-parser normally round-trips cleanly; if it can't, try a textual
  // patch (some older tsconfigs are subtly malformed).
  if (errors.length > 0 || !parsed || typeof parsed !== "object") {
    return patchIncludeTextually(file, content);
  }

  const current: unknown = (parsed as { include?: unknown }).include;
  const list = Array.isArray(current) ? current : [];

  if (list.includes(KELTRA_TYPES_GLOB)) return "already";

  const edits = modify(content, ["include"], [...list, KELTRA_TYPES_GLOB], {
    formattingOptions: { insertSpaces: true, tabSize: 2 },
  });

  if (edits.length === 0) return "skipped";

  await writeFile(file, applyEdits(content, edits));
  return "added";
}

async function patchIncludeTextually(
  file: string,
  content: string,
): Promise<EditStatus> {
  if (content.includes(KELTRA_TYPES_GLOB)) return "already";

  const match = /"include"\s*:\s*\[([\s\S]*?)\]/.exec(content);
  if (!match) return "skipped";

  const inner = match[1]!.trimEnd().replace(/,$/, "");
  const newInner =
    inner === ""
      ? `"${KELTRA_TYPES_GLOB}"`
      : `${inner}, "${KELTRA_TYPES_GLOB}"`;

  const before = content.slice(0, match.index);
  const after = content.slice(match.index + match[0].length);
  await writeFile(file, `${before}"include": [${newInner}]${after}`);
  return "added";
}

// ---------------------------------------------------------------------------
// Next.js config
// ---------------------------------------------------------------------------

export async function addNextIntegration(root: string): Promise<EditStatus> {
  const file = ["next.config.ts", "next.config.js", "next.config.mjs"]
    .map((name) => join(root, name))
    .find(existsSync);
  if (!file) return "skipped";

  let content = await readFile(file, "utf8");
  if (content.includes("withKeltra")) return "already";

  // Wrap `export default <identifier>;` or `module.exports = <identifier>;`.
  // Supports the `satisfies NextConfig` form too.
  const exportPattern =
    /(export\s+default|module\.exports\s*=)\s+([A-Za-z_$][\w$]*)(?:\s+satisfies\s+[A-Za-z_$][\w$<>,\s]*)?;/;
  const match = exportPattern.exec(content);
  if (!match) return "skipped"; // function/object exports → leave manual

  const [, keyword, identifier] = match;
  content = content.replace(match[0], `${keyword} withKeltra(${identifier});`);

  // Add the import right after the last existing import line.
  if (
    !content.includes('from "keltra/next"') &&
    !content.includes("from 'keltra/next'")
  ) {
    content = insertAfterLastImport(
      content,
      'import { withKeltra } from "keltra/next";',
    );
  }

  await writeFile(file, content);
  return "added";
}

// ---------------------------------------------------------------------------
// Vite config
// ---------------------------------------------------------------------------

export async function addViteIntegration(root: string): Promise<EditStatus> {
  const file = [
    "vite.config.ts",
    "vite.config.mts",
    "vite.config.js",
    "vite.config.mjs",
  ]
    .map((name) => join(root, name))
    .find(existsSync);
  if (!file) return "skipped";

  let content = await readFile(file, "utf8");
  if (content.includes("keltra/vite")) return "already";

  const pluginName = "keltra()";
  const pluginsPattern = /plugins\s*:\s*\[([\s\S]*?)\]/;
  const pluginsMatch = pluginsPattern.exec(content);

  if (pluginsMatch) {
    const inner = pluginsMatch[1]!.trim();
    const newInner = inner === "" ? pluginName : `${pluginName}, ${inner}`;
    content =
      content.slice(0, pluginsMatch.index) +
      `plugins: [${newInner}]` +
      content.slice(pluginsMatch.index + pluginsMatch[0].length);
  } else {
    // No plugins key — inject one into `defineConfig({ ... })`.
    const defineMatch = /defineConfig\s*\(\s*\{/.exec(content);
    if (!defineMatch) return "skipped";
    const insertAt = defineMatch.index + defineMatch[0].length;
    content =
      content.slice(0, insertAt) +
      `\n  plugins: [${pluginName}],` +
      content.slice(insertAt);
  }

  if (
    !content.includes('from "keltra/vite"') &&
    !content.includes("from 'keltra/vite'")
  ) {
    content = insertAfterLastImport(
      content,
      'import keltra from "keltra/vite";',
    );
  }

  await writeFile(file, content);
  return "added";
}

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

function insertAfterLastImport(content: string, importLine: string): string {
  const lines = content.split("\n");
  let lastImport = -1;
  for (let i = 0; i < lines.length; i++) {
    if (/^\s*import\b/.test(lines[i]!)) lastImport = i;
  }
  if (lastImport >= 0) {
    lines.splice(lastImport + 1, 0, importLine);
  } else {
    lines.unshift(importLine);
  }
  return lines.join("\n");
}
