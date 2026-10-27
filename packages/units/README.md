# `@nxgt/units`

Units of measure with no I/O and no database. Units belong to a **family**
(mass, volume, ...) and convert through a linear factor; an item can carry its
own **conversion table**, which wins over the family and is the only way
across families; an entered quantity becomes a `Quantity` with its factor
frozen and its value in the item's base unit. Rounding is decimal-safe:
`round(1.005, 2)` is `1.01` and `0.1 + 0.2` is `0.3`.

## Install

```bash
bun add @nxgt/units
```

Peer: `typescript` `^6.0.3 || ^7.0.0`, with `"moduleResolution": "bundler"`;
`nodenext` is not supported. ESM only, no dependency.

## Units and conversion

```ts
import { convert, type Unit } from '@nxgt/units';

const kg: Unit = { id: 'kg', family: 'mass', factor: 1000, decimals: 3 };
const g: Unit = { id: 'g', family: 'mass', factor: 1, decimals: 0 };

convert(2.5, kg, g); // 2500, rounded to the decimals of g
convert(1, g, kg); // 0.001
```

`factor` is how many of the family's base unit make one of the unit. `convert`
stays inside one family; another family throws `no-conversion-path`.

## Rounding and entry

```ts
import { assertDecimals, round } from '@nxgt/units';

round(1.005, 2); // 1.01, half away from zero
round(-2.5, 0); // -3
assertDecimals(2.55, 1); // throws UnitsError, code 'too-many-decimals'
```

## An item's quantity

```ts
import { resolveQuantity } from '@nxgt/units';

const units = [
	{ id: 'kg', family: 'mass', factor: 1000, decimals: 3 },
	{ id: 'g', family: 'mass', factor: 1, decimals: 0 },
	{ id: 'l', family: 'volume', factor: 1000, decimals: 3 },
];
// This item is kept in kg; 1 l of it weighs 0.9 kg.
const context = {
	base: 'kg',
	units,
	conversions: [{ unitId: 'l', factor: 0.9 }],
};

resolveQuantity({ quantity: 250, unitId: 'g' }, context);
// { quantity: 250, unitId: 'g', factor: 0.001, baseQuantity: 0.25 }
resolveQuantity({ quantity: 2, unitId: 'l' }, context);
// { quantity: 2, unitId: 'l', factor: 0.9, baseQuantity: 1.8 }
```

The order is the base unit (factor 1), the item's table, the family, then a
table entry of the same family. An entry finer than its unit's `decimals` is
refused; pass `{ finer: 'round' }` to round it.

## Errors

Everything throws `UnitsError`, with a `code`: `unknown-unit`,
`no-conversion-path`, `too-many-decimals`, `invalid-decimals`,
`invalid-factor`, `not-finite`. See [troubleshooting](docs/troubleshooting.md).

## More

- [Guide](docs/README.md)
- [Troubleshooting](docs/troubleshooting.md)
- [Roadmap](docs/roadmap.md)
