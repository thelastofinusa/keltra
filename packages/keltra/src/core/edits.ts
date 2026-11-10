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
// Framework config edits
// ---------------------------------------------------------------------------

/** Shared helper for configs that take a `plugins: [...]` array (Vite,
 * SvelteKit, webpack, ...). Inserts `plugin` into the plugins array — or
 * creates one inside `defineConfig({ ... })` — and adds the import line,
 * unless the config already references the integration. */
async function addFrameworkPlugin(
  root: string,
  options: {
    files: string[];
    importSpecifier: string; // e.g. "keltra/vite"
    plugin: string; // e.g. "keltra()"
  },
): Promise<EditStatus> {
  const file = options.files.map((name) => join(root, name)).find(existsSync);
  if (!file) return "skipped";

  let content = await readFile(file, "utf8");
  if (content.includes(options.importSpecifier)) return "already";

  const pluginsPattern = /plugins\s*:\s*\[([\s\S]*?)\]/;
  const pluginsMatch = pluginsPattern.exec(content);

  if (pluginsMatch) {
    const inner = pluginsMatch[1]!.trim();
    const newInner =
      inner === "" ? options.plugin : `${options.plugin}, ${inner}`;
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
      `\n  plugins: [${options.plugin}],` +
      content.slice(insertAt);
  }

  const importLine = `import keltra from "${options.importSpecifier}";`;
  if (
    !content.includes(`from "${options.importSpecifier}"`) &&
    !content.includes(`from '${options.importSpecifier}'`)
  ) {
    content = insertAfterLastImport(content, importLine);
  }

  await writeFile(file, content);
  return "added";
}

export async function addViteIntegration(root: string): Promise<EditStatus> {
  return addFrameworkPlugin(root, {
    files: [
      "vite.config.ts",
      "vite.config.mts",
      "vite.config.js",
      "vite.config.mjs",
    ],
    importSpecifier: "keltra/vite",
    plugin: "keltra()",
  });
}

export async function addSveltekitIntegration(
  root: string,
): Promise<EditStatus> {
  return addFrameworkPlugin(root, {
    files: [
      "vite.config.ts",
      "vite.config.mts",
      "vite.config.js",
      "vite.config.mjs",
    ],
    importSpecifier: "keltra/sveltekit",
    plugin: "keltra()",
  });
}

export async function addWebpackIntegration(root: string): Promise<EditStatus> {
  return addFrameworkPlugin(root, {
    files: ["webpack.config.js", "webpack.config.ts", "webpack.config.mjs"],
    importSpecifier: "keltra/webpack",
    plugin: "keltra()",
  });
}

export async function addAstroIntegration(root: string): Promise<EditStatus> {
  const file = ["astro.config.mjs", "astro.config.ts"]
    .map((name) => join(root, name))
    .find(existsSync);
  if (!file) return "skipped";

  let content = await readFile(file, "utf8");
  if (content.includes("keltra/astro")) return "already";

  content = insertAfterLastImport(
    content,
    'import keltra from "keltra/astro";',
  );

  const defineMatch = /defineConfig\s*\(\s*\{/.exec(content);
  if (!defineMatch) return "skipped";
  const insertAt = defineMatch.index + defineMatch[0].length;
  content =
    content.slice(0, insertAt) +
    `\n  integrations: [keltra()],` +
    content.slice(insertAt);

  await writeFile(file, content);
  return "added";
}

export async function addNuxtIntegration(root: string): Promise<EditStatus> {
  const file = ["nuxt.config.ts", "nuxt.config.js", "nuxt.config.mjs"]
    .map((name) => join(root, name))
    .find(existsSync);
  if (!file) return "skipped";

  let content = await readFile(file, "utf8");
  if (content.includes('"keltra/nuxt"') || content.includes("'keltra/nuxt'"))
    return "already";

  // Don't clobber an existing `modules` array.
  if (/modules\s*:/.test(content)) return "skipped";

  const defineMatch = /defineNuxtConfig\s*\(\s*\{/.exec(content);
  if (!defineMatch) return "skipped";
  const insertAt = defineMatch.index + defineMatch[0].length;
  content =
    content.slice(0, insertAt) +
    `\n  modules: ["keltra/nuxt"],` +
    content.slice(insertAt);

  await writeFile(file, content);
  return "added";
}

/** Wires up the framework config for every framework keltra knows about.
 * Returns "skipped" for "other" and when there is nothing safe to edit. */
export async function addFrameworkIntegration(
  root: string,
  framework: Framework,
): Promise<EditStatus> {
  switch (framework) {
    case "next":
      return addNextIntegration(root);
    case "nuxt":
      return addNuxtIntegration(root);
    case "astro":
      return addAstroIntegration(root);
    case "sveltekit":
      return addSveltekitIntegration(root);
    case "vite":
      return addViteIntegration(root);
    case "webpack":
      return addWebpackIntegration(root);
    default:
      return "skipped";
  }
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
