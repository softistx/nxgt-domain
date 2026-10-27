import { UnitsError } from './errors';
import { assertDecimals, round } from './round';
import type { Conversion, Quantity, QuantityInput, Unit } from './types';

/** What a unit is resolved against. */
export interface ResolveContext {
	/** The item's base unit, by id. */
	readonly base: string;
	/** Every known unit. */
	readonly units: readonly Unit[];
	/** The item's own conversions; they win over the families. */
	readonly conversions?: readonly Conversion[];
}

export interface ResolveOptions {
	/**
	 * What to do with an entry finer than its unit's decimals: `'refuse'`
	 * (default) throws `too-many-decimals`, `'round'` rounds it.
	 */
	readonly finer?: 'refuse' | 'round';
}

function find(units: readonly Unit[], id: string): Unit {
	const unit = units.find((one) => one.id === id);
	if (!unit) throw new UnitsError('unknown-unit', `unit "${id}" is not known`);
	return unit;
}

function checkFactor(factor: number, unitId: string): number {
	if (!Number.isFinite(factor) || factor <= 0) {
		throw new UnitsError(
			'invalid-factor',
			`the factor of "${unitId}" must be a positive finite number, got ${factor}`,
		);
	}
	return factor;
}

/** A derived factor without float noise: `0.001 * 0.9` is `0.0009`. */
function clean(factor: number): number {
	return Number(factor.toPrecision(12));
}

/**
 * The factor from `unitId` to the base unit. In order: the base itself (1);
 * the item's conversion for that unit; the family factors when the unit is of
 * the base's family; a conversion of another unit of the same family, scaled
 * by their family factors. Anything else has no path.
 */
export function factorToBase(unitId: string, context: ResolveContext): number {
	const { units, conversions = [] } = context;
	const base = find(units, context.base);
	const unit = find(units, unitId);
	if (unit.id === base.id) return 1;

	const own = conversions.find((entry) => entry.unitId === unit.id);
	if (own) return checkFactor(own.factor, unit.id);

	if (unit.family === base.family) return clean(unit.factor / base.factor);

	for (const entry of conversions) {
		const via = units.find((one) => one.id === entry.unitId);
		if (via && via.family === unit.family) {
			return clean(
				(unit.factor / via.factor) * checkFactor(entry.factor, via.id),
			);
		}
	}
	throw new UnitsError(
		'no-conversion-path',
		`no path from "${unit.id}" (${unit.family}) to "${base.id}" (${base.family}): add a conversion for this item`,
	);
}

/**
 * An entered quantity as a `Quantity`: the factor is frozen, and
 * `baseQuantity` is rounded to the base unit's decimals.
 */
export function resolveQuantity(
	input: QuantityInput,
	context: ResolveContext,
	options: ResolveOptions = {},
): Quantity {
	const unit = find(context.units, input.unitId);
	const base = find(context.units, context.base);
	const quantity =
		options.finer === 'round'
			? round(input.quantity, unit.decimals)
			: assertDecimals(input.quantity, unit.decimals);
	const factor = factorToBase(unit.id, context);
	return {
		quantity,
		unitId: unit.id,
		factor,
		baseQuantity: round(quantity * factor, base.decimals),
	};
}
