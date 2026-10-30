import { defineConfig } from "tsdown";

export default defineConfig({
  // One build, many entry points. Each key becomes a file in dist/,
  // and package.json "exports" points at those files.
  entry: {
    index: "src/index.ts",

    // Framework integrations (thin wrappers over core)
    // "integrations/vite": "src/integrations/vite.ts",
    // "integrations/next": "src/integrations/next.ts",
    // "integrations/webpack": "src/integrations/webpack.ts",
    // "integrations/nuxt": "src/integrations/nuxt.ts",
    // "integrations/astro": "src/integrations/astro.ts",
    // "integrations/sveltekit": "src/integrations/sveltekit.ts",

    // Image components
    // "image/index": "src/image/index.tsx",
    // "image/next": "src/image/next.tsx",

    // CLI (src/cli/index.ts must start with #!/usr/bin/env node)
    "cli/index": "src/cli/index.ts",
  },

  format: "esm",
  platform: "node",
  target: "node20",

  // Always emit .mjs / .d.mts so the names match package.json "exports"
  fixedExtension: true,
  dts: true,

  clean: true,
  sourcemap: true,
  treeshake: true,

  // dependencies and peerDependencies are external by default.
  // These make sure React's runtime and Next's subpaths are never bundled.
  external: ["react", "react/jsx-runtime", /^next(\/|$)/],
});
