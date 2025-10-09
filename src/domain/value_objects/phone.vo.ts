export class Phone {
	private constructor(private readonly value: string) {
		if (!this.isValid(value)) {
			throw new Error("Phone is invalid");
		}
	}

	static create(value: string): Phone {
		const cleaned = value.replace(/\D/g, "");
		return new Phone(cleaned);
	}

	private isValid(phone: string): boolean {
		const cleaned = phone.replace(/\D/g, "");

		return cleaned.length === 10 || cleaned.length === 11;
	}

	getValue(): string {
		return this.value;
	}

	getFormatted(): string {
		if (this.value.length === 11) {
			return `(${this.value.substring(0, 2)}) ${this.value.substring(2, 7)}-${this.value.substring(7)}`;
		}
		return `(${this.value.substring(0, 2)}) ${this.value.substring(2, 6)}-${this.value.substring(6)}`;
	}

	equals(other: Phone): boolean {
		return this.value === other.value;
	}
}
