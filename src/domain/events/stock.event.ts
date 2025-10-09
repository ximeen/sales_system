import type { DomainEvent } from "./product.event";

export class StockCreateEvent implements DomainEvent {
	readonly occuredAt: Date;

	constructor(
		public readonly aggregateId: string,
		public readonly locationId: string,
		public readonly locationCode: string,
		public readonly initialQuantity: number,
	) {
		this.occuredAt = new Date();
	}
}

export class StockIncreaseEvent implements DomainEvent {
	readonly occuredAt: Date;

	constructor(
		public readonly aggregateId: string,
		public readonly productId: string,
		public readonly quantity: number,
		public readonly locationCode: string,
	) {
		this.occuredAt = new Date();
	}
}

export class StockDecreaseEvent implements DomainEvent {
	readonly occuredAt: Date;

	constructor(
		public readonly aggregateId: string,
		public readonly productId: string,
		public readonly quantity: number,
		public readonly locationCode: string,
	) {
		this.occuredAt = new Date();
	}
}

export class StockLowLevelEvent implements DomainEvent {
	readonly occuredAt: Date;
	constructor(
		public readonly aggregateId: string,
		public readonly productId: string,
		public readonly currentQuantity: number,
		public readonly minimumQuantity: number,
		public readonly locationCode: string,
	) {
		this.occuredAt = new Date();
	}
}
