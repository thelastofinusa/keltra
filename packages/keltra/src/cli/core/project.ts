import { readFile } from "node:fs/promises";
import { join } from "node:path";

export type Framework =
  | "next"
  | "nuxt"
  | "astro"
  | "sveltekit"
  | "vite"
  | "webpack"
  | "other";

export interface FrameworkInfo {
  name: string;
  value: Framework;
  description: string;
  /** Default asset folder for this framework. */
  assetDir: string;
  /** package.json dependencies that identify the framework. */
  packages: string[];
  /** How to hook keltra into the framework (shown after init). */
  integration?: {
    file: string;
    importLine: string;
    usage: string;
  };
}

/**
 * Order matters: it is the detection priority. Next, Nuxt, Astro and
 * SvelteKit all use Vite or webpack internally, so they must come first.
 */
export const FRAMEWORKS: FrameworkInfo[] = [
  {
    name: "Next.js",
    value: "next",
    description: "App Router or Pages Router",
    assetDir: "public",
    packages: ["next"],
    integration: {
      file: "next.config.ts",
      importLine: 'import { withKeltra } from "keltra/next"',
      usage: "export default withKeltra(nextConfig)",
    },
  },
  {
    name: "Nuxt",
    value: "nuxt",
    description: "Vue meta-framework",
    assetDir: "public",
    packages: ["nuxt"],
    integration: {
      file: "nuxt.config.ts",
      importLine: "",
      usage: 'modules: ["keltra/nuxt"]',
    },
  },
  {
    name: "Astro",
    value: "astro",
    description: "Content-focused sites",
    assetDir: "public",
    packages: ["astro"],
    integration: {
      file: "astro.config.mjs",
      importLine: 'import keltra from "keltra/astro"',
      usage: "integrations: [keltra()]",
    },
  },
  {
    name: "SvelteKit",
    value: "sveltekit",
    description: "Svelte application framework",
    assetDir: "static",
    packages: ["@sveltejs/kit"],
    integration: {
      file: "vite.config.ts",
      importLine: 'import keltra from "keltra/sveltekit"',
      usage: "plugins: [sveltekit(), keltra()]",
    },
  },
  {
    name: "Vite",
    value: "vite",
    description: "React, Vue, Svelte or plain TypeScript",
    assetDir: "public",
    packages: ["vite"],
    integration: {
      file: "vite.config.ts",
      importLine: 'import keltra from "keltra/vite"',
      usage: "plugins: [keltra()]",
    },
  },
  {
    name: "webpack",
    value: "webpack",
    description: "Custom webpack setups",
    assetDir: "public",
    packages: ["webpack"],
    integration: {
      file: "webpack.config.js",
      importLine: 'import keltra from "keltra/webpack"',
      usage: "plugins: [keltra()]",
    },
  },
  {
    name: "Other / none",
    value: "other",
    description: "Only use the CLI (keltra generate)",
    assetDir: "public",
    packages: [],
  },
];

export function getFramework(value: Framework): FrameworkInfo {
  return (
    FRAMEWORKS.find((f) => f.value === value) ??
    FRAMEWORKS[FRAMEWORKS.length - 1]!
  );
}

export interface ProjectPackageJson {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

export async function readPackageJson(
  root: string,
): Promise<ProjectPackageJson | undefined> {
  try {
    const raw = await readFile(join(root, "package.json"), "utf8");
    return JSON.parse(raw) as ProjectPackageJson;
  } catch {
    return undefined;
  }
}

export function hasDependency(pkg: ProjectPackageJson, name: string): boolean {
  return Boolean(pkg.dependencies?.[name] ?? pkg.devDependencies?.[name]);
}

export function detectFramework(pkg: ProjectPackageJson): Framework {
  const match = FRAMEWORKS.find((f) =>
    f.packages.some((name) => hasDependency(pkg, name)),
  );
  return match?.value ?? "other";
}
