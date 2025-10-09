export class Location {
	private constructor(
		private readonly name: string,
		private readonly code: string,
		private readonly type: "WAREHOUSE" | "STORE" | "OTHER",
	) {
		if (!name || name.trim().length === 0) {
			throw new Error("Name cannot be empty");
		}

		if (!code || code.trim().length === 0) {
			throw new Error("Code cannot be empty");
		}
	}

	static create(
		name: string,
		code: string,
		type: "WAREHOUSE" | "STORE" | "OTHER",
	): Location {
		return new Location(name.trim(), code.trim().toUpperCase(), type);
	}
	getName(): string {
		return this.name;
	}

	getCode(): string {
		return this.code;
	}

	getType(): string {
		return this.type;
	}

	equals(other: Location): boolean {
		return this.code === other.code;
	}
}
