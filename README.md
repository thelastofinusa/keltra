## keltra

Typed asset paths for modern frontend frameworks.

keltra scans your asset folders and generates a typed manifest, so every image and file path in your code gets autocomplete and type-checking. Works with Vite, Next.js, and more, from a single package.

> **Status:** v2 rewrite in progress. The API below is a draft and may change.

### How it works

1. You add the keltra integration for your framework.
2. When you start your dev server, keltra scans your asset folders and
   generates a type manifest (types plus a small runtime module) into `.keltra/`.
3. While the server runs, keltra watches the folders and regenerates the
   manifest whenever you add, rename, or delete a file.
4. Production builds generate the manifest too, so type errors for missing
   assets show up in CI. You can also run `npx keltra generate` on its own.

Use whichever API you prefer: a typed `assetPath()` helper, or a drop-in
`<Image>` component. Both read the same generated manifest.

### Install

```bash
bun add keltra
# or: npm install keltra / pnpm add keltra / yarn add keltra
```

Or let the CLI set everything up for you:

```bash
npx keltra init
```

The CLI detects your framework, adds the config, and installs what's needed.

### Usage

1. Add the integration

- **Vite**

  ```ts
  // vite.config.ts
  import { defineConfig } from "vite";
  import keltra from "keltra/vite";

  export default defineConfig({
    plugins: [keltra()],
  });
  ```

- **Next.js**

  ```ts
  // next.config.ts
  import { withKeltra } from "keltra/next";

  export default withKeltra({
    // your Next.js config
  });
  ```

2. Use typed paths

- **`assetPath`: no component required**

  ```ts
  import { assetPath } from "keltra";

  const logo = assetPath("/images/logo.svg"); // autocompletes, returns the URL

  assetPath("/images/lgo.svg"); // type error: no such asset
  ```

  Use it anywhere a string path is expected: `<img src>`, CSS-in-JS,
  metadata, Open Graph tags, and so on.

- **`<Image>` component**

  ```tsx
  import { Image } from "keltra/image";

  export function Hero() {
    // `src` autocompletes from the files in your asset folders
    return (
      <Image src="/images/hero.png" alt="Hero" width={1200} height={600} />
    );
  }
  ```

  On Next.js, import from `keltra/image/next` to get a component that wraps
  `next/image` with the same typed `src`.

### Development

Requires [Bun](https://bun.sh).

```bash
bun install        # install all workspace dependencies
bun run build      # build the keltra package
bun run dev        # build in watch mode
bun run typecheck  # type-check every workspace
bun run test       # run the test suite
```

### Releasing

Versioning uses [Changesets](https://github.com/changesets/changesets):

```bash
bun run changeset          # describe your change
bun run version-packages   # bump versions and update the changelog
bun run release            # build and publish to npm
```

### License

This project is licensed under the [MIT License](/LICENSE).
