## keltra

keltra scans your asset folders and generates a typed manifest, so every image and file path in your code gets autocomplete and type-checking. Works with Vite today, with Next.js and more on the way, from a single package.

### The problem

You know the bug: someone renames `hero.png` to `hero-2x.png`, the build passes, and the image 404s in production three days later. Paths in code are just strings, and TypeScript can't tell a real file from a typo.

keltra turns your asset folders into types. A path that doesn't exist is a compile error, and the paths that do exist autocomplete as you type.

### How it works

1. You add the keltra integration for your framework.
2. When you start your dev server, keltra scans your asset folders and generates a type manifest (types plus a small runtime module) into `.keltra/`.
3. While the server runs, keltra watches the folders and regenerates the manifest whenever you add, rename, or delete a file.
4. Production builds generate the manifest too, so type errors for missing assets show up in CI. You can also run `npx keltra generate` on its own.

Use whichever API you prefer: a typed [`assetPath()`](https://usekeltra.vercel.app/reference/asset-path) helper, or a drop-in [`<Img />`](https://usekeltra.vercel.app/reference/image) component. Both read the same generated manifest.

### What you get

- **Autocomplete** for every file in your asset folders.
- **Compile-time errors** for paths that don't exist, often with a "did you mean" suggestion.
- **Base path support**, so images keep working when your site is served from a sub-path.
- **A CLI** that sets a project up and regenerates the manifest in CI.

### Framework support

| Framework                                   | Status      | Entry point                        |
| ------------------------------------------- | ----------- | ---------------------------------- |
| Vite (React, Vue, Svelte, plain TypeScript) | Available   | `keltra/vite`                      |
| Next.js                                     | In progress | `keltra/next`, `keltra/image/next` |
| Nuxt, Astro, SvelteKit, webpack             | Planned     |                                    |

See [Framework support](https://usekeltra.vercel.app/guides/frameworks) for details.

### Next steps

Continue with [Getting Started](https://usekeltra.vercel.app/introduction/getting-started) to set up your first project.

### License

This project is licensed under the [MIT License](/LICENSE).
