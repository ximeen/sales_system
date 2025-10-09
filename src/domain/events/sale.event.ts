import type { DomainEvent } from "./product.event";

export class SaleCreatedEvent implements DomainEvent {
	readonly occuredAt: Date;

	constructor(
		public readonly aggregateId: string,
		public readonly customerId: string,
		public readonly totalAmount: number,
		public readonly itemsCount: number,
	) {
		this.occuredAt = new Date();
	}
}

export class SaleItemAddEvent implements DomainEvent {
	readonly occuredAt: Date;

	constructor(
		public readonly aggregateId: string,
		public readonly productId: string,
		public readonly quantity: number,
	) {
		this.occuredAt = new Date();
	}
}

export class SaleItemRemovedEvent implements DomainEvent {
	readonly occuredAt: Date;

	constructor(
		public readonly aggregateId: string,
		public readonly itemId: string,
	) {
		this.occuredAt = new Date();
	}
}

export class SaleDiscountAppliedEvent implements DomainEvent {
	readonly occuredAt: Date;

	constructor(
		public readonly aggregateId: string,
		public readonly discountAmount: number,
	) {
		this.occuredAt = new Date();
	}
}

export class SaleConfirmedEvent implements DomainEvent {
	readonly occuredAt: Date;

	constructor(
		public readonly aggregateId: string,
		public readonly customerId: string,
		public readonly totalAmount: number,
	) {
		this.occuredAt = new Date();
	}
}

export class SalePaidEvent implements DomainEvent {
	readonly occuredAt: Date;

	constructor(
		public readonly aggregateId: string,
		public readonly totalPaid: number,
	) {
		this.occuredAt = new Date();
	}
}

export class SaleCancelledEvent implements DomainEvent {
	readonly occuredAt: Date;

	constructor(
		public readonly aggregateId: string,
		public readonly reasons?: string,
	) {
		this.occuredAt = new Date();
	}
}
