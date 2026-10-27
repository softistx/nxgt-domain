# Rounding

`round(value, decimals)` rounds **half away from zero** and works on the
number's written form, not on `value * 10 ** decimals`:

```ts
import { round } from '@nxgt/units';

round(1.005, 2); // 1.01  (Math.round(1.005 * 100) / 100 gives 1)
round(0.1 + 0.2, 2); // 0.3
round(-2.5, 0); // -3
round(-0.004, 2); // 0, never -0
```

`decimals` is an integer from 0 to 100, and the value must be finite;
otherwise `UnitsError` with code `invalid-decimals` or `not-finite`.

## Refusing an entry

```ts
import { assertDecimals, decimalPlaces } from '@nxgt/units';

decimalPlaces(2.55); // 2
assertDecimals(2.55, 1); // throws, code 'too-many-decimals'
assertDecimals(2.5, 1); // 2.5
```

`resolveQuantity` calls `assertDecimals` with the entry unit's `decimals`; give
it `{ finer: 'round' }` to round instead:

```ts
resolveQuantity({ quantity: 1.5, unitId: 'g' }, context, { finer: 'round' });
```

## A caveat

The check reads how the number is written. `0.1 + 0.2` is the double
`0.30000000000000004` and has 17 decimals, so it is refused: round a computed
value before it is an entry.
