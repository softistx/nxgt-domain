/** A unit of measure. */
export interface Unit {
	readonly id: string;
	/** Units of one family convert to each other through their factors. */
	readonly family: string;
	/** How many of the family's base unit make one of this unit (linear only). */
	readonly factor: number;
	/** The finest decimals a quantity in this unit is kept with. */
	readonly decimals: number;
}

/** An item's own conversion: one `unitId` equals `factor` of the item's base unit. */
export interface Conversion {
	readonly unitId: string;
	readonly factor: number;
}

/** What a user enters. */
export interface QuantityInput {
	readonly quantity: number;
	readonly unitId: string;
}

/** A quantity with its factor frozen and its value in the item's base unit. */
export interface Quantity {
	readonly quantity: number;
	readonly unitId: string;
	/** Factor from `unitId` to the item's base unit, as it was at entry. */
	readonly factor: number;
	/** `quantity * factor`, rounded to the base unit's decimals. */
	readonly baseQuantity: number;
}
