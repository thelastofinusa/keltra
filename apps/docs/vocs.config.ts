import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import {
  Changelog,
  defineConfig,
  Embedding,
  Feedback,
  McpSource,
  Retriever,
  Twoslash,
} from "vocs/config";
import pkg from "../../packages/keltra/package.json" with { type: "json" };

// ---------------------------------------------------------------------------
// npm stats: version + downloads, cached for 1 hour
// ---------------------------------------------------------------------------

type NpmStats = {
  version: string;
  weeklyDownloads: number | null;
  monthlyDownloads: number | null;
};

type CacheEntry = { fetchedAt: number; data: NpmStats };

const CACHE_TTL_MS = 60 * 60 * 1000;
const CACHE_FILE = join(
  import.meta.dirname,
  "node_modules/.cache/npm-stats-keltra.json",
);

async function fetchNpmStats(packageName: string): Promise<NpmStats> {
  const [versionRes, weeklyRes, monthlyRes] = await Promise.all([
    fetch(`https://registry.npmjs.org/${packageName}/latest`),
    fetch(`https://api.npmjs.org/downloads/point/last-week/${packageName}`),
    fetch(`https://api.npmjs.org/downloads/point/last-month/${packageName}`),
  ]);

  if (!versionRes.ok || !weeklyRes.ok || !monthlyRes.ok) {
    throw new Error(
      `npm API returned ${versionRes.status}/${weeklyRes.status}/${monthlyRes.status}`,
    );
  }

  const [versionData, weeklyData, monthlyData] = await Promise.all([
    versionRes.json(),
    weeklyRes.json(),
    monthlyRes.json(),
  ]);

  return {
    version: versionData.version,
    weeklyDownloads: weeklyData.downloads ?? null,
    monthlyDownloads: monthlyData.downloads ?? null,
  };
}

async function getNpmStats(packageName: string): Promise<NpmStats> {
  // 1. Fresh cache
  if (existsSync(CACHE_FILE)) {
    try {
      const cached: CacheEntry = JSON.parse(readFileSync(CACHE_FILE, "utf8"));
      if (Date.now() - cached.fetchedAt < CACHE_TTL_MS) return cached.data;
    } catch {
      // corrupt cache — fall through
    }
  }

  // 2. Fetch and re-write cache
  try {
    const data = await fetchNpmStats(packageName);
    mkdirSync(dirname(CACHE_FILE), { recursive: true });
    writeFileSync(
      CACHE_FILE,
      JSON.stringify({ fetchedAt: Date.now(), data } satisfies CacheEntry),
    );
    return data;
  } catch (error) {
    console.warn("[vocs.config] Failed to fetch npm stats:", error);

    // 3. Stale cache as last resort
    if (existsSync(CACHE_FILE)) {
      try {
        const cached: CacheEntry = JSON.parse(readFileSync(CACHE_FILE, "utf8"));
        console.warn("[vocs.config] Using stale cache.");
        return cached.data;
      } catch {
        // ignore
      }
    }

    // 4. Hard fallback: local package.json, no download count
    return {
      version: pkg.version,
      weeklyDownloads: null,
      monthlyDownloads: null,
    };
  }
}

function formatCount(n: number | null): string | null {
  if (n == null) return null;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return n.toLocaleString("en-US");
}

const stats = await getNpmStats("keltra");
const monthlyLabel = formatCount(stats.monthlyDownloads);
// Swap the line below in if you'd rather show weekly:
// const monthlyLabel = formatCount(stats.weeklyDownloads);

const versionLabel = `v${stats.version}${
  monthlyLabel ? ` • ${monthlyLabel}/mo` : ""
}`;

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

export default defineConfig({
  title: "Keltra - Auto-complete for your Web Assets",
  titleTemplate: "%s – Keltra",

  iconUrl: {
    light: "/icon-light.svg",
    dark: "/icon-dark.svg",
  },

  logoUrl: {
    light: "/logo-tight-light.svg",
    dark: "/logo-tight-dark.svg",
  },

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
          text: "Integrations",
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
        { text: "CLI", link: "/reference/cli" },
        { text: "assetPath", link: "/reference/asset-path" },
        { text: "Image", link: "/reference/image" },
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
    "Keltra generates a typed manifest from your asset folders for autocomplete, build-time validation, and zero broken references.",

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
      text: versionLabel,
      items: [
        {
          text: "NPM",
          link: "https://www.npmjs.com/package/keltra",
        },
        {
          text: "Contributing",
          link: "https://github.com/thelastofinusa/keltra/blob/main/CONTRIBUTING.md",
        },
      ],
    },
  ],
});
