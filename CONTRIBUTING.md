# Contributing

Thanks for helping improve **game-life**.

## Development

```bash
npm install
npm run dev
```

Quality gates before PR:

```bash
npm test -- --run
npm run typecheck
npm run build
```

## Project layout

| Path | Role |
|------|------|
| `src/rewrite/engine` | Pure game rules (no React) |
| `src/rewrite/storage` | Save / history / validation |
| `src/rewrite/ui` | Screens & components |
| `src/content` | Pack registry, integrity, schema |
| `src/data` | Default (base) content |
| `extensions/` | Optional pack sources (no copyrighted dumps) |

## Content packs

- Default pack must stay original / rights-clear.
- Do **not** open PRs that add commercial IP text, character names, or assets.
- Prefer schema + tests for pack validation changes.

## Code style

- TypeScript strict; avoid `any` in new code.
- Engine changes should come with unit tests.
- Keep diffs focused; no drive-by refactors.

## License

By contributing, you agree your contributions are licensed under the MIT License
(see `LICENSE`), excluding any third-party pack content you do not own.
