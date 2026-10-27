# nxgt-domain

Domain building blocks, published to npm as `@nxgt/*`: pure, typed, no I/O.

| Package                         | What it is                                                                             |
| ------------------------------- | -------------------------------------------------------------------------------------- |
| [`@nxgt/units`](packages/units) | units of measure: families, item conversions, decimal-safe rounding, frozen quantities |

Bun workspace, versioned with changesets. See [AGENTS.md](AGENTS.md).

```bash
bun install
bun run check && bun run build && bun run typecheck && bun run test && bun run verify:artifacts
```
