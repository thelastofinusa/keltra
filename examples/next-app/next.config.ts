import { withKeltra } from "keltra/next";
import type { NextConfig } from "next";

const nextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
} satisfies NextConfig;

export default withKeltra(nextConfig);
