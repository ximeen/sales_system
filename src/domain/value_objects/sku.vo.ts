export class SKU {
	private constructor(private readonly value: string) {
		if (!value || value.trim().length === 0) {
			throw new Error("SKU cannot be null");
		}

		if (value.length > 50) {
			throw new Error("Value cannot be longer than 50 characters");
		}
	}

	static create(value: string): SKU {
		return new SKU(value.trim().toString());
	}

	getValue(): string {
		return this.value;
	}

	equals(other: SKU): boolean {
		return this.value === other.value;
	}
}
