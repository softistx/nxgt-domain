# AGENTS.md

The single source of truth for any coding agent working here. The owner's global
rules (`~/.claude/CLAUDE.md`) apply; this file states only what is this
repository's own. `CLAUDE.md` points here and holds nothing else.

## What this is

A library monorepo in the nxgt-data pattern (`nxgt-monorepo:lay-out-a-library-monorepo`):
a Bun workspace, `packages/*` published to npm as `@nxgt/*` with changesets.
Packages are pure domain helpers: no I/O, no database, no framework.

## Layout and shared files

`bunfig.toml`, `.gitignore`, `LICENSE`, `tsconfig.base.json`, `tsconfig.json`,
`scripts/tsconfig.json`, `build.ts`, `scripts/artifacts/*`,
`scripts/workspace.ts` and `scripts/publish.ts` are copied byte for byte from
nxgt-data: a change goes to nxgt-data first. Imports carry no extension and
consumers resolve with `"moduleResolution": "bundler"`; every package README says so.

Every package starts `"private": true`; removing it is its own commit.

## Declared divergences from nxgt-data

- No services: no Redis, Mongo, Meilisearch or SeaweedFS scripts, no cache
  steps in `ci.yml`, no `newest-peers` job, no `nxgt-versions` workflow, no
  `examples/`. CI runs on `pull_request` only (no cache to warm on `push`).
- `release.yml` declares `environment: npm` (the token lives in that GitHub
  environment, not a repository secret); nxgt-data's does not yet.
- `setup/action.yml` does not set `REDISMS_DISABLE_POSTINSTALL` (no Redis here).
- `scripts/verify-artifacts.ts` names its temp directory `nxgt-domain-verify-`.
- Bun is pinned to 1.4.4 (`packageManager` and the setup action), nxgt-data is on 1.4.3.
- `biome.json`'s `$schema` is 2.6.3, the Biome `bun.lock` resolves.
- No `docs/superpowers` folder.

## Rules

- **Pure and small.** No dependency, no I/O. Each export is documented in the
  package README and `docs/`; no private application name appears anywhere.
- **Typed errors**: a package throws one class with a `code` (`UnitsError`).
- **Decimal-safe numbers**: never round with `Math.round(x * 10 ** n) / 10 ** n`;
  `round` shifts the decimal point through the number's written form.
- **Green bar**: `bunx biome ci`, `bun run build` (before typecheck), `bun run typecheck`,
  `bun run test`, `bun run verify:artifacts`, and a changeset for a package change.
- Conventional Commits; one branch, one PR per slice; a worktree under
  `~/workspace/worktrees/nxgt-domain/`.
