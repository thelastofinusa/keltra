// deno-fmt-ignore-file
// biome-ignore format: generated types do not need formatting
// prettier-ignore
import type { PathsForPages } from 'waku/router'

// prettier-ignore
type Page =
  | { path: '/guides/ci'; render: 'static' }
  | { path: '/guides/deployment'; render: 'static' }
  | { path: '/guides/frameworks'; render: 'static' }
  | { path: '/guides/troubleshooting'; render: 'static' }
  | { path: '/guides/vite'; render: 'static' }
  | { path: '/'; render: 'static' }
  | { path: '/introduction/getting-started'; render: 'static' }
  | { path: '/introduction/what-is-keltra'; render: 'static' }
  | { path: '/reference/asset-path'; render: 'static' }
  | { path: '/reference/cli'; render: 'static' }
  | { path: '/reference/config'; render: 'static' }
  | { path: '/reference/generated-files'; render: 'static' }
  | { path: '/reference/image'; render: 'static' }
  | { path: '/reference/vite-plugin'; render: 'static' }

// prettier-ignore
declare module 'waku/router' {
  interface RouteConfig {
    paths: PathsForPages<Page>
  }
  interface CreatePagesConfig {
    pages: Page
  }
}
