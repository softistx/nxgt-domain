import { UnitsError } from './errors';
import { checkFactor } from './resolve';
import { round } from './round';
import type { Unit } from './types';

/** Converts within one family, rounded to `to.decimals`. Another family has no path. */
export function convert(value: number, from: Unit, to: Unit): number {
	if (from.family !== to.family) {
		throw new UnitsError(
			'no-conversion-path',
			`${from.id} (${from.family}) cannot become ${to.id} (${to.family}) without an item conversion`,
		);
	}
	checkFactor(from.factor, from.id);
	checkFactor(to.factor, to.id);
	return round((value * from.factor) / to.factor, to.decimals);
}
