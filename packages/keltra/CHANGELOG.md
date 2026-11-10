# keltra

## 0.2.0

### Minor Changes

- `keltra init` now wires up your project automatically for every framework it detects — not just Vite and Next.js. It adds `".keltra/*.d.ts"` to your tsconfig (`tsconfig.app.json` for Vite) and edits your framework config file (`next.config.ts`, `vite.config.ts`, `nuxt.config.*`, `astro.config.*`, `webpack.config.*`) when it can do so safely, so you rarely need to apply setup steps by hand. The framework prompt now confirms the detected framework first and only lists all frameworks if you say no.The image component is now `KTImg` (`import { KTImg } from "keltra/image"` or `keltra/image/next`), so it can sit next to `next/image` in the same file without a naming clash. `Image` is still exported as a back-compat alias.

## 0.1.16

### Patch Changes

- Bump version

## 0.1.13

### Patch Changes

- Rename references from Img to Image across the documentation files to reflect the updated component naming

## 0.1.12

### Patch Changes

- Update babel packages to latest versions for improved performance and security
