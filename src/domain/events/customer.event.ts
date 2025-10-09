import type { DomainEvent } from "./product.event";

export class CustomerCreatedEvent implements DomainEvent {
	readonly occuredAt: Date;

	constructor(
		public readonly aggregateId: string,
		public readonly name: string,
		public readonly email: string,
		public readonly document: string,
	) {
		this.occuredAt = new Date();
	}
}

export class CustomerUpdatedEvent implements DomainEvent {
	readonly occuredAt: Date;
	constructor(
		public readonly aggregateId: string,
		public readonly changes: Record<string, any>,
	) {
		this.occuredAt = new Date();
	}
}

export class CustomerActivatedEvent implements DomainEvent {
	readonly occuredAt: Date;
	constructor(public readonly aggregateId: string) {
		this.occuredAt = new Date();
	}
}

export class CustomerDesactivatedEvent implements DomainEvent {
	readonly occuredAt: Date;
	constructor(public readonly aggregateId: string) {
		this.occuredAt = new Date();
	}
}
