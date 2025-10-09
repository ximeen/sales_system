export class ProductName {
	private constructor(private readonly value: string) {
		if (!value || value.trim().length === 0) {
			throw new Error("Product name cannot be empty");
		}
		if (value.length < 3) {
			throw new Error("Name must have at least 3 characters");
		}
		if (value.length > 200) {
			throw new Error("Name cannot be longer than 200 characters");
		}
	}

	static create(value: string): ProductName {
		return new ProductName(value.trim());
	}

	getValue() {
		return this.value;
	}
}
