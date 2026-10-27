/** Why a units operation failed; stable, safe to switch on. */
export type UnitsErrorCode =
	| 'unknown-unit'
	| 'no-conversion-path'
	| 'too-many-decimals'
	| 'invalid-decimals'
	| 'invalid-factor'
	| 'not-finite';

/** The one error this package throws. */
export class UnitsError extends Error {
	override readonly name = 'UnitsError';

	constructor(
		readonly code: UnitsErrorCode,
		message: string,
	) {
		super(message);
	}
}
