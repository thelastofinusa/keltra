import { Changelog, defineConfig, Embedding, Feedback, McpSource, Retriever, Twoslash } from 'vocs/config'

export default defineConfig({
  title: 'Keltra',
  titleTemplate: '%s – Keltra',
  // iconUrl: {
  //   light: '/icon-light.svg',
  //   dark: '/icon-dark.svg',
  // },
  // logoUrl: {
  //   light: '/logo-light.svg',
  //   dark: '/logo-dark.svg',
  // },
  socials: [
    { icon: 'github', link: 'https://github.com/thelastofinusa/keltra-monorepo' },
  ],
  // accentColor: 'light-dark(#0f766e, #5eead4)',
  sidebar: [
    {
      text: 'Introduction',
      collapsed: false,
      items: [
        { text: 'What is Keltra?', link: '/introduction/what-is-keltra' },
        { text: 'Getting Started', link: '/introduction/getting-started' },
      ],
    },
  ],
  mcp: {
    enabled: true,
    sources: [McpSource.github({ repo: 'thelastofinusa/keltra-monorepo' })],
  },
  ogImageUrl: (path, { baseUrl }) => {
    if (path === '/') {
      const homeOgDescription =
        'Publish docs that stay simple at the source and rich in the browser.'
      const homeOgTitle = 'Minimal Docs\nfor Agents & Humans.'

      return `${baseUrl ?? ''}/api/og?logo=%logo&title=${encodeURIComponent(homeOgTitle)}&description=${encodeURIComponent(homeOgDescription)}`
    }

    return `${baseUrl ?? ''}/api/og?logo=%logo&title=%title&description=%description`
  },
  twoslash: {
    transformers: [Twoslash.experimental_rust({ cargoToml: './Cargo.toml', cacheOnly: true })],
  },
  ai: {
    retriever: process.env.CLOUDFLARE_API_TOKEN
      ? Retriever.local({ embedding: Embedding.cloudflare() })
      : undefined,
  },
  baseUrl:
    process.env.VERCEL_ENV === 'production'
      ? 'https://keltra.vercel.app'
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : 'https://keltra.vercel.app',
  cacheDir: '.vocs/cache',
  changelog: Changelog.github({ repo: 'thelastofinusa/keltra-monorepo' }),
  checkDeadlinks: true,
  feedback: Feedback.from({
    type: "custom",
    async submit(data) {
      console.log(data)
    },
  }),
  description: 'Vocs is a library for creating documentation websites.',
  editLink: {
    link: 'https://github.com/thelastofinusa/keltra-monorepo/edit/rc/site/src/pages/:path',
  },
  topNav: [
    {
      text: 'Guides & API',
      link: '/introduction/getting-started',
      match: (path) =>
        Boolean(
          path?.startsWith('/introduction') ||
            path?.startsWith('/writing') ||
            path?.startsWith('/features') ||
            path?.startsWith('/reference'),
        ),
    },
    {
      text: 'Contributing',
      link: 'https://github.com/thelastofinusa/keltra-monorepo/blob/main/.github/CONTRIBUTING.md',
    },
  ],
})
