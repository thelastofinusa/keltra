import {
  Changelog,
  defineConfig,
  Embedding,
  Feedback,
  McpSource,
  Retriever,
  Twoslash,
} from "vocs/config";

export default defineConfig({
  title: "Keltra",
  titleTemplate: "%s – Keltra",
  // iconUrl: {
  //   light: '/icon-light.svg',
  //   dark: '/icon-dark.svg',
  // },
  // logoUrl: {
  //   light: '/logo-light.svg',
  //   dark: '/logo-dark.svg',
  // },
  socials: [
    {
      icon: "github",
      link: "https://github.com/thelastofinusa/keltra-monorepo",
    },
  ],
  // accentColor: 'light-dark(#0f766e, #5eead4)',
  sidebar: [
    {
      text: "Introduction",
      collapsed: false,
      items: [
        { text: "What is Keltra?", link: "/introduction/what-is-keltra" },
        { text: "Getting Started", link: "/introduction/getting-started" },
      ],
    },
  ],
  mcp: {
    enabled: true,
    sources: [McpSource.github({ repo: "thelastofinusa/keltra-monorepo" })],
  },
  twoslash: {
    transformers: [
      Twoslash.experimental_rust({
        cargoToml: "./Cargo.toml",
        cacheOnly: true,
      }),
    ],
  },
  ai: {
    retriever: process.env.CLOUDFLARE_API_TOKEN
      ? Retriever.local({ embedding: Embedding.cloudflare() })
      : undefined,
  },
  baseUrl:
    process.env.VERCEL_ENV === "production"
      ? "https://usekeltra.vercel.app"
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "https://usekeltra.vercel.app",
  cacheDir: ".vocs/cache",
  changelog: Changelog.github({ repo: "thelastofinusa/keltra-monorepo" }),
  checkDeadlinks: true,
  feedback: Feedback.from({
    type: "custom",
    async submit(data) {
      console.log(data);
    },
  }),
  description:
    "keltra generates a typed manifest from your asset folders — so imports autocomplete, missing files fail the build, and you never ship a broken image reference again.",
  editLink: {
    link: "https://github.com/thelastofinusa/keltra-monorepo/edit/main/apps/docs/src/pages/:path",
  },
  topNav: [
    {
      text: "Guides",
      link: "/introduction/getting-started",
      match: (path) =>
        Boolean(
          path?.startsWith("/introduction") ||
            path?.startsWith("/writing") ||
            path?.startsWith("/features") ||
            path?.startsWith("/reference"),
        ),
    },
    {
      text: "Contributing",
      link: "https://github.com/thelastofinusa/keltra-monorepo/blob/main/.github/CONTRIBUTING.md",
    },
  ],
});
