export class Money {
	private constructor(
		private readonly amount: number,
		private readonly currency: string = "BRL",
	) {
		if (amount < 0) {
			throw new Error("Amount cannot be negative");
		}
	}

	static create(amount: number, currency: string = "BRL"): Money {
		return new Money(amount, currency);
	}

	getAmount(): number {
		return this.amount;
	}

	getCurrency(): string {
		return this.currency;
	}

	add(other: Money): Money {
		if (this.currency !== other.currency) {
			throw new Error("Different currencies");
		}

		return Money.create(this.amount + other.amount, this.currency);
	}

	multiply(factor: number): Money {
		return Money.create(this.amount * factor, this.currency);
	}

	isGreaterThan(other: Money): boolean {
		return this.amount > other.amount;
	}

	equals(other: Money): boolean {
		return this.amount === other.amount && this.currency === other.currency;
	}
}
