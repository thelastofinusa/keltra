import type { NextConfig } from "next";
import {
  type AssetWatcher,
  createKeltra,
  type Keltra,
  type KeltraConfig,
} from "../core";
import { loadConfig } from "../core/load-config";

const PHASE_DEV = "phase-development-server";
const PHASE_BUILD = "phase-production-build";

/**
 * `assetPath` reads this variable to find the app's base path. It must match
 * the literal `process.env.NEXT_PUBLIC_KELTRA_BASE` in `src/index.ts`, which is
 * what Next inlines at build time.
 */
const BASE_ENV_KEY = "NEXT_PUBLIC_KELTRA_BASE";

/** Lets a reloaded config replace the previous watcher instead of stacking. */
const WATCHER_KEY = Symbol.for("keltra.next.watcher");

type PhaseContext = { defaultConfig: NextConfig };

type NextConfigInput =
  | NextConfig
  | Promise<NextConfig>
  | ((
      phase: string,
      context: PhaseContext,
    ) => NextConfig | Promise<NextConfig>);

export type NextConfigFunction = (
  phase: string,
  context: PhaseContext,
) => Promise<NextConfig>;

const plural = (count: number, word: string) =>
  `${count} ${word}${count === 1 ? "" : "s"}`;

async function startWatcher(instance: Keltra): Promise<void> {
  const globals = globalThis as Record<symbol, AssetWatcher | undefined>;
  await globals[WATCHER_KEY]?.close();

  globals[WATCHER_KEY] = instance.watch(({ assets }) => {
    console.log(
      `[keltra] manifest updated (${plural(assets.length, "asset path")})`,
    );
  });
}

/**
 * keltra for Next.js.
 *
 * - `next dev`: generates the manifest and keeps it updated as files change.
 * - `next build`: generates the manifest.
 * - Copies `basePath` into the build, so `assetPath` follows it.
 *
 * Options are merged over `keltra.config.ts`. Prefer the config file, since
 * the CLI (`keltra generate`) only reads the file.
 *
 * @example
 * // next.config.ts
 * import { withKeltra } from "keltra/next";
 * export default withKeltra({ basePath: "/docs" });
 */
export function withKeltra(
  nextConfig: NextConfigInput = {},
  options: KeltraConfig = {},
): NextConfigFunction {
  return async (phase, context) => {
    const resolved =
      typeof nextConfig === "function"
        ? await nextConfig(phase, context)
        : await nextConfig;

    if (phase === PHASE_DEV || phase === PHASE_BUILD) {
      const root = process.cwd();
      const fromFile = await loadConfig(root);
      const instance = createKeltra({ ...fromFile, ...options }, root);

      await instance.generate();
      if (phase === PHASE_DEV) await startWatcher(instance);
    }

    return {
      ...resolved,
      env: {
        ...resolved.env,
        [BASE_ENV_KEY]: resolved.basePath ?? "",
      },
    };
  };
}

export type { KeltraConfig as KeltraNextOptions };
