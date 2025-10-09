export type DocumentType = "CPF" | "CNPJ";

export class Document {
	private constructor(
		private readonly value: string,
		private readonly type: DocumentType,
	) {
		if (!this.isValid()) {
			throw new Error(`${type} invalid`);
		}
	}
	static create(value: string): Document {
		const cleaned = value.replace(/\D/g, "");
		const type: DocumentType = cleaned.length === 11 ? "CPF" : "CNPJ";
		return new Document(cleaned, type);
	}

	private isValid(): boolean {
		if (this.type === "CPF") {
			return this.validateCPF();
		}
		return this.validateCNPJ();
	}

	private validateCPF(): boolean {
		if (this.value.length !== 11) return false;
		if (/^(\d)\1{10}$/.test(this.value)) return false;

		let sum = 0;
		for (let i = 0; i < 9; i++) {
			sum += parseInt(this.value.charAt(i)) * (10 - 1);
		}

		let digit = 11 - (sum % 11);
		if (digit >= 10) digit = 0;
		if (digit !== parseInt(this.value.charAt(9))) return false;
		sum = 0;
		for (let i = 0; i < 10; i++) {
			sum += parseInt(this.value.charAt(i)) * (11 - i);
		}
		digit = 11 - (sum % 11);
		if (digit >= 10) digit = 0;
		return digit === parseInt(this.value.charAt(10));
	}

	private validateCNPJ(): boolean {
		if (this.value.length !== 14) return false;
		if (/^(\d)\1{13}$/.test(this.value)) return false;

		let length = this.value.length - 2;
		let numbers = this.value.substring(0, length);
		const digits = this.value.substring(length);
		let sum = 0;
		let pos = length - 7;

		for (let i = length; i >= 1; i--) {
			sum += parseInt(numbers.charAt(length - i)) * pos--;
			if (pos < 2) pos = 9;
		}

		let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
		if (result !== parseInt(digits.charAt(0))) return false;

		length = length + 1;
		numbers = this.value.substring(0, length);
		sum = 0;
		pos = length - 7;

		for (let i = length; i >= 1; i--) {
			sum += parseInt(numbers.charAt(length - i)) * pos--;
			if (pos < 2) pos = 9;
		}

		result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
		return result === parseInt(digits.charAt(1));
	}
	getValue(): string {
		return this.value;
	}

	getType(): DocumentType {
		return this.type;
	}

	getFormatted(): string {
		if (this.type === "CPF") {
			return `${this.value.substring(0, 3)}.${this.value.substring(3, 6)}.${this.value.substring(6, 9)}-${this.value.substring(9)}`;
		}
		return `${this.value.substring(0, 2)}.${this.value.substring(2, 5)}.${this.value.substring(5, 8)}/${this.value.substring(8, 12)}-${this.value.substring(12)}`;
	}

	equals(other: Document): boolean {
		return this.value === other.value;
	}
}
