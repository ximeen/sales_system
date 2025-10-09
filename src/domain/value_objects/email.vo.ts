export class Email {
	private constructor(private readonly value: string) {
		if (!this.isValid(value)) {
			throw new Error("Email is invalid");
		}
	}

	static create(value: string): Email {
		return new Email(value.toLowerCase().trim());
	}

	private isValid(email: string): boolean {
		const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return regex.test(email);
	}

	getValue(): string {
		return this.value;
	}

	equal(other: Email): boolean {
		return this.value === other.value;
	}
}
