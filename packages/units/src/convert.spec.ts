import { describe, expect, test } from 'bun:test';
import { convert } from './convert';
import { UnitsError } from './errors';
import type { Unit } from './types';

const kg: Unit = { id: 'kg', family: 'mass', factor: 1000, decimals: 3 };
const g: Unit = { id: 'g', family: 'mass', factor: 1, decimals: 0 };
const l: Unit = { id: 'l', family: 'volume', factor: 1000, decimals: 3 };

describe('convert', () => {
	test('goes through the family factors and rounds to the target decimals', () => {
		expect(convert(2.5, kg, g)).toBe(2500);
		expect(convert(1, g, kg)).toBe(0.001);
		expect(convert(1.2345, g, kg)).toBe(0.001);
		expect(convert(0.1, kg, g)).toBe(100);
	});

	test('a unit to itself is a rounded identity', () => {
		expect(convert(1.5, g, g)).toBe(2);
		expect(convert(-1.5, g, g)).toBe(-2);
	});

	test('refuses another family', () => {
		try {
			convert(1, kg, l);
			throw new Error('did not throw');
		} catch (error) {
			expect(error).toBeInstanceOf(UnitsError);
			expect((error as UnitsError).code).toBe('no-conversion-path');
		}
	});

	test('refuses a unit whose factor is not positive', () => {
		const zero: Unit = { id: 'zero', family: 'mass', factor: 0, decimals: 0 };
		for (const [from, to] of [
			[g, zero],
			[zero, g],
		] as const) {
			try {
				convert(1, from, to);
				throw new Error('did not throw');
			} catch (error) {
				expect((error as UnitsError).code).toBe('invalid-factor');
			}
		}
	});
});
