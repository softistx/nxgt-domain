import { describe, expect, test } from 'bun:test';
import { UnitsError } from './errors';
import { factorToBase, resolveQuantity } from './resolve';
import type { Conversion, Unit } from './types';

const kg: Unit = { id: 'kg', family: 'mass', factor: 1000, decimals: 3 };
const g: Unit = { id: 'g', family: 'mass', factor: 1, decimals: 0 };
const l: Unit = { id: 'l', family: 'volume', factor: 1000, decimals: 3 };
const ml: Unit = { id: 'ml', family: 'volume', factor: 1, decimals: 0 };
const units = [kg, g, l, ml];

function code(run: () => unknown): string | undefined {
	try {
		run();
	} catch (error) {
		if (error instanceof UnitsError) return error.code;
		throw error;
	}
	return undefined;
}

describe('factorToBase', () => {
	test('the base unit is 1', () => {
		expect(factorToBase('kg', { base: 'kg', units })).toBe(1);
	});

	test('the family factor within a family', () => {
		expect(factorToBase('g', { base: 'kg', units })).toBe(0.001);
		expect(factorToBase('kg', { base: 'g', units })).toBe(1000);
	});

	test('the item table wins over the family', () => {
		const conversions: Conversion[] = [{ unitId: 'g', factor: 0.002 }];
		expect(factorToBase('g', { base: 'kg', units, conversions })).toBe(0.002);
	});

	test('the table is the only way across families', () => {
		expect(code(() => factorToBase('l', { base: 'kg', units }))).toBe(
			'no-conversion-path',
		);
		const conversions: Conversion[] = [{ unitId: 'l', factor: 0.9 }];
		expect(factorToBase('l', { base: 'kg', units, conversions })).toBe(0.9);
	});

	test('a table entry carries its own family across', () => {
		// 1 l of this item weighs 0.9 kg, so 1 ml weighs 0.0009 kg.
		const conversions: Conversion[] = [{ unitId: 'l', factor: 0.9 }];
		expect(factorToBase('ml', { base: 'kg', units, conversions })).toBe(0.0009);
	});

	test('names what is missing', () => {
		expect(code(() => factorToBase('lb', { base: 'kg', units }))).toBe(
			'unknown-unit',
		);
		expect(code(() => factorToBase('kg', { base: 'lb', units }))).toBe(
			'unknown-unit',
		);
		const conversions: Conversion[] = [{ unitId: 'lb', factor: 1 }];
		expect(
			code(() => factorToBase('l', { base: 'kg', units, conversions })),
		).toBe('no-conversion-path');
	});

	test('refuses a factor that is not a positive number', () => {
		for (const factor of [0, -1, Number.NaN, Number.POSITIVE_INFINITY]) {
			const conversions: Conversion[] = [{ unitId: 'l', factor }];
			expect(
				code(() => factorToBase('l', { base: 'kg', units, conversions })),
			).toBe('invalid-factor');
		}
	});
});

describe('resolveQuantity', () => {
	test('freezes the factor and rounds the base quantity to the base decimals', () => {
		expect(
			resolveQuantity({ quantity: 250, unitId: 'g' }, { base: 'kg', units }),
		).toEqual({
			quantity: 250,
			unitId: 'g',
			factor: 0.001,
			baseQuantity: 0.25,
		});
		expect(
			resolveQuantity({ quantity: 3, unitId: 'g' }, { base: 'kg', units }),
		).toEqual({ quantity: 3, unitId: 'g', factor: 0.001, baseQuantity: 0.003 });
	});

	test('crosses families through the table', () => {
		const conversions: Conversion[] = [{ unitId: 'l', factor: 0.9 }];
		expect(
			resolveQuantity(
				{ quantity: 2, unitId: 'l' },
				{ base: 'kg', units, conversions },
			),
		).toEqual({ quantity: 2, unitId: 'l', factor: 0.9, baseQuantity: 1.8 });
	});

	test('rounds half away from zero, negatives included', () => {
		// 5 g = 0.005 kg; 0.0005 kg would be below the 3 decimals of kg.
		const conversions: Conversion[] = [{ unitId: 'g', factor: 0.0001 }];
		const context = { base: 'kg', units, conversions };
		expect(
			resolveQuantity({ quantity: 5, unitId: 'g' }, context).baseQuantity,
		).toBe(0.001);
		expect(
			resolveQuantity({ quantity: -5, unitId: 'g' }, context).baseQuantity,
		).toBe(-0.001);
	});

	test('has no float drift', () => {
		const conversions: Conversion[] = [{ unitId: 'ml', factor: 0.1 }];
		expect(
			resolveQuantity(
				{ quantity: 3, unitId: 'ml' },
				{ base: 'l', units: [...units], conversions },
			).baseQuantity,
		).toBe(0.3);
	});

	test('refuses an entry finer than the unit by default', () => {
		expect(
			code(() =>
				resolveQuantity({ quantity: 1.5, unitId: 'g' }, { base: 'kg', units }),
			),
		).toBe('too-many-decimals');
	});

	test('can round the entry instead', () => {
		expect(
			resolveQuantity(
				{ quantity: 1.5, unitId: 'g' },
				{ base: 'kg', units },
				{ finer: 'round' },
			),
		).toEqual({ quantity: 2, unitId: 'g', factor: 0.001, baseQuantity: 0.002 });
	});

	test('a missing path is an error, not a guess', () => {
		expect(
			code(() =>
				resolveQuantity({ quantity: 1, unitId: 'l' }, { base: 'kg', units }),
			),
		).toBe('no-conversion-path');
	});
});
