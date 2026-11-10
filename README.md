## Keltra

**Autocomplete for your web assets.** keltra scans your asset folders and generates a typed manifest, so every image and file path in your code gets autocomplete and type-checking — a renamed or missing file becomes a compile error instead of a 404 in production.

```ts
import { assetPath } from "keltra";
import { KTImg } from "keltra/image";

<img src={assetPath("/logo.svg")} alt="Logo" />
<KTImg src="/images/hero.png" alt="Hero" width={1200} height={600} />
```

Paths autocomplete from your `public/` folder. Typos fail the build.

### Install

```bash
npx keltra init
```

That's the whole setup. `keltra init` installs keltra, writes a `keltra.config.ts`, adds `.keltra/` to your `.gitignore`, wires up your `tsconfig` and framework config, and generates the first manifest.

See [Getting Started](https://usekeltra.vercel.app/introduction/getting-started) for a walkthrough, or [Framework support](https://usekeltra.vercel.app/guides/frameworks) for the current list.

### What it does

- **Autocomplete** for every file in your asset folders
- **Compile-time errors** for paths that don't exist
- **Base path support**, so images keep working under a sub-path
- **A CLI** for setup and CI

Works with Vite and Next.js today. More frameworks planned.

### Documentation

Full docs live at **[Official Website](https://usekeltra.vercel.app)**:

- [What is Keltra?](https://usekeltra.vercel.app/introduction/what-is-keltra) — the problem and how it works
- [Getting Started](https://usekeltra.vercel.app/introduction/getting-started) — set up in an existing project
- [Vite guide](https://usekeltra.vercel.app/guides/vite) / [Next.js guide](https://usekeltra.vercel.app/guides/nextjs)
- [Configuration](https://usekeltra.vercel.app/reference/config) — every option in `keltra.config.ts`
- [CLI](https://usekeltra.vercel.app/reference/cli) — `init`, `generate`, `update`
- [Troubleshooting](https://usekeltra.vercel.app/guides/troubleshooting)

### License

This project is licensed under the [MIT License](/LICENSE).
