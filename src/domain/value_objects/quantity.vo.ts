export class Quantity {
	private constructor(private readonly value: number) {
		if (!Number.isInteger(value)) {
			throw new Error("Quantity must be a whole number");
		}

		if (value < 0) {
			throw new Error("Value cannot be negative");
		}
	}

	static create(value: number) {
		return new Quantity(value);
	}

	getValue(): number {
		return this.value;
	}

	add(other: Quantity): Quantity {
		return Quantity.create(this.value + other.value);
	}

	subtract(other: Quantity): Quantity {
		const result = this.value - other.value;
		if (result < 0) {
			throw new Error("Result cannot be negative");
		}

		return Quantity.create(result);
	}

	isGreaterThan(other: Quantity): boolean {
		return this.value > other.value;
	}

	isGreaterOrEqual(other: Quantity): boolean {
		return this.value >= other.value;
	}

	equals(other: Quantity): boolean {
		return this.value === other.value;
	}
}
