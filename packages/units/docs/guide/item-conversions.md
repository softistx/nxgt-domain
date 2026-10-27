# Item conversions

One litre of oil is not one litre of honey in kilograms. An item carries its
own table of `Conversion { unitId, factor }`: one `unitId` equals `factor` of
the **item's base unit**.

```ts
import { resolveQuantity } from '@nxgt/units';

const context = {
	base: 'kg', // the item's base unit id
	units, // every known Unit
	conversions: [{ unitId: 'l', factor: 0.9 }], // 1 l weighs 0.9 kg
};

resolveQuantity({ quantity: 2, unitId: 'l' }, context);
// { quantity: 2, unitId: 'l', factor: 0.9, baseQuantity: 1.8 }
```

## Precedence

`factorToBase(unitId, context)` answers the factor from a unit to the base,
taking the first that applies:

1. the unit is the base: `1`;
2. the item's table has the unit: its factor, **even inside the base's
   family** (the table wins over the family);
3. the unit is of the base's family: `unit.factor / base.factor`;
4. the table has another unit of the unit's family: the family ratio times
   that entry, so `ml` follows an `l` entry;
5. otherwise `UnitsError` with code `no-conversion-path`.

An unknown unit id, or a table factor that is not a positive finite number,
throws `unknown-unit` or `invalid-factor`.

## A Quantity

`resolveQuantity` returns `{ quantity, unitId, factor, baseQuantity }`. Store
the whole record: `factor` is frozen at entry, so a later edit of the table
does not rewrite old quantities, and `baseQuantity` is `quantity * factor`
rounded to the **base unit's** decimals.

An entry finer than its own unit's decimals is refused by default; see
[rounding](rounding.md).
