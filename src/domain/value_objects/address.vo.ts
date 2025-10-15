export interface AddressProps {
	street: string;
	number: string;
	complement?: string;
	neighborhood: string;
	city: string;
	state: string;
	zipCode: string;
	country: string;
}

export class Address {
	private constructor(private readonly props: AddressProps) {
		this.validate();
	}
	static create(props: AddressProps): Address {
		return new Address({
			...props,
			street: props.street.trim(),
			number: props.number.trim(),
			complement: props.complement?.trim(),
			neighborhood: props.neighborhood.trim(),
			city: props.city.trim(),
			state: props.state.trim().toUpperCase(),
			zipCode: props.zipCode.replace(/\D/g, ""),
			country: props.country.trim(),
		});
	}

	private validate(): void {
		if (!this.props.street) throw new Error("Street is required");
		if (!this.props.number) throw new Error("Number is required");
		if (!this.props.neighborhood) throw new Error("Neighborhood is required");
		if (!this.props.city) throw new Error("City is required");
		if (!this.props.state) throw new Error("State is required");
		if (!this.props.zipCode) throw new Error("zip code is required");
		if (this.props.zipCode.length !== 8) throw new Error("zip code is invalid");
		if (!this.props.country) throw new Error("coutry is required");
	}
	get number(): string {
		return this.props.number;
	}
	get street(): string {
		return this.props.street;
	}
	get complement(): string | undefined {
		return this.props.complement;
	}

	get neighborhood(): string {
		return this.props.neighborhood;
	}

	get city(): string {
		return this.props.city;
	}

	get state(): string {
		return this.props.state;
	}

	get zipCode(): string {
		return this.props.zipCode;
	}

	get zipCodeFormatted(): string {
		return `${this.props.zipCode.substring(0, 5)}-${this.props.zipCode.substring(5)}`;
	}

	get country(): string {
		return this.props.country;
	}

	getFullAddress(): string {
		const complement = this.props.complement
			? `, ${this.props.complement}`
			: "";
		return `${this.props.street}, ${this.props.number}${complement}, ${this.props.neighborhood}, ${this.props.city} - ${this.props.state}, ${this.zipCodeFormatted}`;
	}

	equals(other: Address): boolean {
		return (
			this.props.street === other.props.street &&
			this.props.number === other.props.number &&
			this.props.zipCode === other.props.zipCode
		);
	}
}
