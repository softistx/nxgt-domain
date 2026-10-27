import { UnitsError } from './errors';

const MAX_DECIMALS = 100;

/** Moves the decimal point of `value` by `places`, through its written form. */
function shift(value: number, places: number): number {
	const [mantissa = '0', exponent = '0'] = String(value).split('e');
	return Number(`${mantissa}e${Number(exponent) + places}`);
}

function checkDecimals(decimals: number): void {
	if (!Number.isInteger(decimals) || decimals < 0 || decimals > MAX_DECIMALS) {
		throw new UnitsError(
			'invalid-decimals',
			`decimals must be an integer from 0 to ${MAX_DECIMALS}, got ${decimals}`,
		);
	}
}

function checkFinite(value: number): void {
	if (!Number.isFinite(value)) {
		throw new UnitsError('not-finite', `${value} is not a finite number`);
	}
}

/**
 * Rounds to `decimals`, half away from zero, working on the number's written
 * form so that `round(1.005, 2)` is `1.01` and `0.1 + 0.2` is `0.3`.
 */
export function round(value: number, decimals: number): number {
	checkFinite(value);
	checkDecimals(decimals);
	const scaled = shift(Math.abs(value), decimals);
	// Too large to scale: it has no decimals to round away.
	if (!Number.isFinite(scaled)) return value;
	const rounded = shift(Math.round(scaled), -decimals);
	return value < 0 && rounded !== 0 ? -rounded : rounded;
}

/** How many decimals `value` is written with (`1.5e-7` has 8). */
export function decimalPlaces(value: number): number {
	checkFinite(value);
	const [mantissa = '0', exponent = '0'] = String(Math.abs(value)).split('e');
	const fraction = mantissa.split('.')[1]?.length ?? 0;
	return Math.max(0, fraction - Number(exponent));
}

/** Returns `value` when it has at most `decimals` decimals; throws otherwise. */
export function assertDecimals(value: number, decimals: number): number {
	checkDecimals(decimals);
	const places = decimalPlaces(value);
	if (places > decimals) {
		throw new UnitsError(
			'too-many-decimals',
			`${value} has ${places} decimals, the unit keeps ${decimals}`,
		);
	}
	return value;
}
