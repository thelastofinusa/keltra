## Contributing to keltra

Thanks for taking the time to contribute. This guide is short on purpose — if anything is unclear, open an issue.

**[Prerequisites](#prerequisites) · [Project layout](#project-layout) · [Commands](#commands) · [Working on the library](#working-on-the-library) · [Changesets](#changesets) · [Docs](#docs) · [Pull requests](#pull-requests)**

---

### Prerequisites

- **Node.js** 20.9 or newer (20.19+ if you work inside `packages/keltra`)
- **Bun** 1.3.x — pinned in `package.json` as `packageManager`

### Setup

```bash
git clone https://github.com/thelastofinusa/keltra.git
cd keltra
bun install
bun run build   # so the examples resolve keltra from dist/
```

### Project layout

| Path                                     | What it is                                                           |
| ---------------------------------------- | -------------------------------------------------------------------- |
| `packages/keltra`                        | The published library: core, CLI, image, integrations                |
| `apps/docs`                              | The docs site ([usekeltra.vercel.app](https://usekeltra.vercel.app)) |
| `examples/vite-react`, `examples/nextjs` | Runnable apps that consume the workspace package                     |

Only `packages/keltra` is published. Everything else is private workspace code.

### Commands

Run these from the repo root:

| Command             | What it does                                          |
| ------------------- | ----------------------------------------------------- |
| `bun run build`     | Build every package with Turborepo                    |
| `bun run dev`       | Start dev servers for every workspace                 |
| `bun run typecheck` | Type-check every workspace                            |
| `bun run check`     | Biome lint, format, and organize imports (**writes**) |
| `bun run lint`      | Biome lint only (no writes)                           |
| `bun test`          | Run the library tests                                 |
| `bun run changeset` | Create a changeset (see below)                        |

Inside `packages/keltra`, `bun run dev` runs `tsdown --watch`, so `dist/` stays in sync while you edit.

### Working on the library

1. Edit files under `packages/keltra/src`.
2. Keep `bun run dev` running in `packages/keltra` so `dist/` rebuilds on save.
3. Verify the change in an example: `cd examples/vite-react && bun run dev`, or `cd examples/nextjs && bun run dev`.
4. Add or update tests in `packages/keltra/test`, then run `bun test` from that folder.

If you touched anything the CLI generates, delete `.keltra/` in the example and start the dev server again to confirm it regenerates cleanly. To exercise the CLI itself against an example, run `bunx keltra <command>` from inside the example folder — it resolves to the built workspace binary.

### Changesets

Every user-facing change to `keltra` needs a changeset. It's how versions and the changelog are produced.

```bash
bun run changeset
```

Pick `keltra`, choose `patch` / `minor` / `major`, and write a one-line summary in the past tense (e.g. _"Fix `Img` dropping the base path on Next.js"_). Commit the generated `.changeset/*.md` with your PR. Docs, examples, and internal-only changes don't need one.

### Docs

The docs are MDX files in `apps/docs/src/pages`, built with [Vocs](https://vocs.dev).

```bash
cd apps/docs
bun run dev
```

- **Adding a page:** drop an `.mdx` file into `introduction/`, `guides/`, or `reference/`, then register it in `apps/docs/vocs.config.ts` under `sidebar`.
- **Callouts:** use `:::tip`, `:::info`, or `:::warning` for exceptions and gotchas — not for emphasis.

### Pull requests

Keep them small and focused. Before opening:

- [ ] `bun run check` — formats and lints (writes changes)
- [ ] `bun run typecheck`
- [ ] `bun test` — if you touched `packages/keltra`
- [ ] `bun run changeset` — if the change is user-facing
- [ ] The change runs in at least one example app

In the description, say **what** changed and **why**, and link the issue if there is one. Screenshots help for docs or UI changes. There's no commit-message convention — the changeset is the record that matters.

### License

By contributing, you agree that your contributions are licensed under the [MIT License](/LICENSE).
