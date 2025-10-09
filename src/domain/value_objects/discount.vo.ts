export type DiscounType = "PERCENTAGE" | "FIXED";

export class Discount {
	private constructor(
		private readonly value: number,
		private readonly type: DiscounType,
	) {
		if (value < 0) {
			throw new Error("Discount cannot be negative");
		}
		if (type === "PERCENTAGE" && value > 100) {
			throw new Error("Discount in percentage cannot greater than 100");
		}
	}

	static createPercentage(value: number): Discount {
		return new Discount(value, "PERCENTAGE");
	}

	static createFixed(value: number): Discount {
		return new Discount(value, "FIXED");
	}

	getValue(): number {
		return this.value;
	}

	getType(): DiscounType {
		return this.type;
	}

	calculate(baseValue: number): number {
		if (this.type === "PERCENTAGE") {
			return baseValue * (this.value / 100);
		}

		return Math.min(this.value, baseValue);
	}
}
