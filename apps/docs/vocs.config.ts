import {
  Changelog,
  defineConfig,
  Embedding,
  Feedback,
  McpSource,
  Retriever,
  Twoslash,
} from "vocs/config";
import pkg from "../../packages/keltra/package.json";

const { version } = pkg;

export default defineConfig({
  // Optimized title: 52 characters (Target: 50–60)
  title: "Keltra - The smart autocomplete for your web assets",
  titleTemplate: "%s – Keltra",

  iconUrl: {
    light: "/icon-light.svg",
    dark: "/icon-dark.svg",
  },

  logoUrl: {
    light: "/logo-tight-light.svg",
    dark: "/logo-tight-dark.svg",
  },

  // accentColor: "light-dark(#2563eb, #60a5fa)",

  socials: [
    {
      icon: "github",
      link: "https://github.com/thelastofinusa/keltra",
    },
  ],
  sidebar: [
    {
      text: "Introduction",
      collapsed: false,
      items: [
        { text: "What is Keltra?", link: "/introduction/what-is-keltra" },
        { text: "Getting Started", link: "/introduction/getting-started" },
      ],
    },
    {
      text: "Guides",
      collapsed: false,
      items: [
        {
          text: "Frameworks",
          items: [
            { text: "Vite", link: "/guides/vite" },
            { text: "Next.js", link: "/guides/nextjs" },
          ],
        },
        { text: "Framework support", link: "/guides/frameworks" },
        { text: "Deployment", link: "/guides/deployment" },
        { text: "Continuous integration", link: "/guides/ci" },
        { text: "Troubleshooting", link: "/guides/troubleshooting" },
      ],
    },
    {
      text: "Reference",
      collapsed: false,
      items: [
        { text: "Configuration", link: "/reference/config" },
        { text: "assetPath", link: "/reference/asset-path" },
        { text: "Image", link: "/reference/image" },
        { text: "CLI", link: "/reference/cli" },
        { text: "Vite plugin", link: "/reference/vite-plugin" },
        { text: "Next.js plugin", link: "/reference/next-plugin" },
        { text: "Generated files", link: "/reference/generated-files" },
      ],
    },
  ],
  mcp: {
    enabled: true,
    sources: [
      McpSource.github({
        name: "keltra",
        repo: "thelastofinusa/keltra",
        paths: ["packages", "examples"],
      }),
    ],
  },
  ogImageUrl: (path, { baseUrl }) => `${baseUrl ?? ""}/og-image.webp`,
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
  changelog: Changelog.github({ repo: "thelastofinusa/keltra" }),
  checkDeadlinks: true,
  feedback: Feedback.from({
    type: "custom",
    async submit(data) {
      const webhookUrl = process.env.DISCORD_KELTRA_WEBHOOK_URL;

      if (!webhookUrl) {
        console.error(
          "❌ DISCORD_KELTRA_WEBHOOK_URL is not defined in environment variables!",
        );
        return;
      }

      const isHelpful = data.helpful;
      const category = data.category ? ` [${data.category.toUpperCase()}]` : "";
      const timestamp = data.timestamp
        ? new Date(data.timestamp).toISOString()
        : new Date().toISOString();

      try {
        const res = await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            embeds: [
              {
                title: `📝 Keltra Docs Feedback${category}`,
                description: data.message || "_No written comment provided._",
                color: isHelpful ? 3066993 : 15158332,
                fields: [
                  {
                    name: "Rating",
                    value: isHelpful ? "👍 Helpful" : "👎 Needs Work",
                    inline: true,
                  },
                  {
                    name: "Page URL",
                    value: data.pageUrl
                      ? `[View Page](${data.pageUrl})`
                      : "N/A",
                    inline: true,
                  },
                ],
                footer: {
                  text: "Keltra Documentation Feedback Bot",
                },
                timestamp: timestamp,
              },
            ],
          }),
        });

        if (!res.ok) {
          console.error(`❌ Webhook error ${res.status}:`, await res.text());
        } else {
          console.log("✅ Feedback successfully dispatched to Discord!");
        }
      } catch (err) {
        console.error("❌ Error sending feedback to Discord:", err);
      }
    },
  }),

  description:
    "Keltra generates a typed manifest from your asset folders for full autocomplete, build-time validation, and zero broken assets references.",

  editLink: {
    link: "https://github.com/thelastofinusa/keltra/edit/main/apps/docs/src/pages/:path",
  },
  topNav: [
    {
      text: "Guides & API",
      link: "/introduction/getting-started",
      match: (path) =>
        Boolean(
          path?.startsWith("/introduction") || path?.startsWith("/guides"),
        ),
    },
    {
      text: `v${version}`,
      items: [
        {
          text: "Changelog",
          link: "/changelog",
        },
        {
          text: "Contributing",
          link: "https://github.com/thelastofinusa/keltra/blob/main/CONTRIBUTING.md",
        },
      ],
    },
  ],
});
