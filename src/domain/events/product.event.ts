export interface DomainEvent {
	occuredAt: Date;
	aggregateId: string;
}

export class ProductCreatedEvent implements DomainEvent {
	readonly occuredAt: Date;

	constructor(
		public readonly aggregateId: string,
		public readonly name: string,
		public readonly sku: string,
		public readonly price: number,
	) {
		this.occuredAt = new Date();
	}
}

export class ProductPriceChangeEvent implements DomainEvent {
	readonly occuredAt: Date;

	constructor(
		public readonly aggregateId: string,
		public readonly oldPrice: number,
		public readonly newPrice: number,
	) {
		this.occuredAt = new Date();
	}
}

export class ProductActivatedEvent implements DomainEvent {
	readonly occuredAt: Date;

	constructor(public readonly aggregateId: string) {
		this.occuredAt = new Date();
	}
}

export class ProductDeactivatedEvent implements DomainEvent {
	readonly occuredAt: Date;
	constructor(public readonly aggregateId: string) {
		this.occuredAt = new Date();
	}
}
