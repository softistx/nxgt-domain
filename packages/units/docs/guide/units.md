# Units and families

A `Unit` has four fields:

| field      | meaning                                                               |
| ---------- | --------------------------------------------------------------------- |
| `id`       | the key you store and look units up by                                |
| `family`   | units of one family convert through their factors                     |
| `factor`   | how many of the family's base unit make one of this unit; linear only |
| `decimals` | the finest decimals a quantity in this unit keeps                     |

```ts
import { convert, type Unit } from '@nxgt/units';

const kg: Unit = { id: 'kg', family: 'mass', factor: 1000, decimals: 3 };
const g: Unit = { id: 'g', family: 'mass', factor: 1, decimals: 0 };
```

The family's base unit is simply the one with `factor: 1` (`g` here); the
package does not look for it.

## Converting

`convert(value, from, to)` multiplies by `from.factor`, divides by `to.factor`
and rounds to `to.decimals`:

```ts
convert(2.5, kg, g); // 2500
convert(1.2345, g, kg); // 0.001
```

Another family throws a `UnitsError` with code `no-conversion-path`: mass to
volume depends on the item, see [item conversions](item-conversions.md).

Only linear factors are supported: a unit with an offset (temperature in
degrees) is not a `Unit`.
