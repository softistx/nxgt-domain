import { describe, expect, test } from 'bun:test';
import { UnitsError } from './errors';
import { assertDecimals, decimalPlaces, round } from './round';

describe('round', () => {
	test('rounds half away from zero', () => {
		expect(round(0.5, 0)).toBe(1);
		expect(round(1.5, 0)).toBe(2);
		expect(round(2.5, 0)).toBe(3);
		expect(round(-0.5, 0)).toBe(-1);
		expect(round(-2.5, 0)).toBe(-3);
	});

	test('is decimal-safe where scaling by 10^n is not', () => {
		expect(round(1.005, 2)).toBe(1.01);
		expect(round(1.255, 2)).toBe(1.26);
		expect(round(-1.005, 2)).toBe(-1.01);
		expect(round(0.1 + 0.2, 2)).toBe(0.3);
		expect(round(0.1 + 0.2, 15)).toBe(0.3);
		expect(round(8.345, 2)).toBe(8.35);
	});

	test('keeps a value that already fits', () => {
		expect(round(12.5, 3)).toBe(12.5);
		expect(round(7, 0)).toBe(7);
	});

	test('never returns negative zero', () => {
		expect(Object.is(round(-0.004, 2), 0)).toBe(true);
		expect(Object.is(round(-0, 2), 0)).toBe(true);
	});

	test('handles exponent notation', () => {
		expect(round(1e-7, 6)).toBe(0);
		expect(round(5e-7, 6)).toBe(0.000001);
		expect(round(1.5e21, 2)).toBe(1.5e21);
	});

	test('refuses a bad value or bad decimals', () => {
		for (const bad of [Number.NaN, Number.POSITIVE_INFINITY]) {
			expect(() => round(bad, 2)).toThrow(UnitsError);
		}
		for (const bad of [-1, 1.5, 101]) {
			try {
				round(1, bad);
				throw new Error('did not throw');
			} catch (error) {
				expect((error as UnitsError).code).toBe('invalid-decimals');
			}
		}
	});
});

describe('decimalPlaces', () => {
	test('counts the decimals a value is written with', () => {
		expect(decimalPlaces(3)).toBe(0);
		expect(decimalPlaces(3.25)).toBe(2);
		expect(decimalPlaces(-0.001)).toBe(3);
		expect(decimalPlaces(1e-7)).toBe(7);
		expect(decimalPlaces(1.5e-7)).toBe(8);
		expect(decimalPlaces(1e21)).toBe(0);
	});
});

describe('assertDecimals', () => {
	test('accepts a value that fits and returns it', () => {
		expect(assertDecimals(2.5, 1)).toBe(2.5);
		expect(assertDecimals(2, 0)).toBe(2);
	});

	test('refuses a value finer than the decimals', () => {
		try {
			assertDecimals(2.55, 1);
			throw new Error('did not throw');
		} catch (error) {
			expect(error).toBeInstanceOf(UnitsError);
			expect((error as UnitsError).code).toBe('too-many-decimals');
		}
	});
});
