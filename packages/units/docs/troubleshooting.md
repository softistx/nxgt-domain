# Troubleshooting

Every failure is a `UnitsError` with a stable `code`. Switch on the `code`,
never the message.

```ts
import { UnitsError } from '@nxgt/units';

try {
	resolveQuantity(input, context);
} catch (error) {
	if (error instanceof UnitsError && error.code === 'no-conversion-path') {
		// ask for a conversion on the item
	}
}
```

## `no-conversion-path`

Message: `no path from "l" (volume) to "kg" (mass): add a conversion for this
item`, or `kg (mass) cannot become l (volume) without an item conversion`.

It happens when a unit is not of the base's family and the item's table has no
entry of the unit's family. Fix: add `{ unitId, factor }` to the item's
conversions. `convert` never crosses families.

## `unknown-unit`

Message: `unit "lb" is not known`. The unit, or the base, is not in `units`.
Pass every unit, and check the id.

## `too-many-decimals`

Message: `2.55 has 2 decimals, the unit keeps 1`. The entry is finer than its
unit's `decimals`. Refuse it to the user, or pass `{ finer: 'round' }`. A
computed float such as `0.1 + 0.2` has 17 decimals: round it first.

## `invalid-factor`

Message: `the factor of "l" must be a positive finite number, got 0`. A
conversion table factor is zero, negative, `NaN` or infinite.

## `invalid-decimals`

Message: `decimals must be an integer from 0 to 100, got 1.5`. A unit was
declared with `decimals` that is negative, fractional or above 100.

## `not-finite`

Message: `NaN is not a finite number`. A value passed to `round`,
`assertDecimals` or an entry is `NaN` or infinite.

## Types do not resolve

Set `"moduleResolution": "bundler"` in `tsconfig.json`; `nodenext` is not
supported.
