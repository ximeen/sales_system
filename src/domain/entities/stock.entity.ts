import type { DomainEvent } from "../events/product.event";
import {
	StockCreateEvent,
	StockDecreaseEvent,
	StockIncreaseEvent,
	StockLowLevelEvent,
} from "../events/stock.event";
import { Location } from "../value_objects/location.vo";
import { Quantity } from "../value_objects/quantity.vo";
import { StockMovement, type MovementReasons } from "./stock_movement.entity";

export interface StockProps {
	id: string;
	productId: string;
	location: Location;
	quantity: Quantity;
	minimumQuantity: Quantity;
	maximumQuantity?: Quantity;
	reservedQuantity: Quantity;
	tenantId: string;
	createdAt: Date;
	updatedAt: Date;
}

export class Stock {
	private props: StockProps;
	private domainEvents: DomainEvent[] = [];

	private constructor(props: StockProps) {
		this.props = props;
	}

	static create(
		id: string,
		productId: string,
		locationName: string,
		locationCode: string,
		locationType: "WAREHOUSE" | "STORE" | "OTHER",
		initialQuantity: number,
		minimumQuantity: number,
		tenantId: string,
		maximumQuantity?: number,
	): Stock {
		const location = Location.create(locationName, locationCode, locationType);
		const quantity = Quantity.create(initialQuantity);
		const minQty = Quantity.create(minimumQuantity);
		const maxQty = maximumQuantity
			? Quantity.create(maximumQuantity)
			: undefined;
		const now = new Date();

		const stock = new Stock({
			id,
			productId,
			location,
			quantity,
			minimumQuantity: minQty,
			maximumQuantity: maxQty,
			reservedQuantity: Quantity.create(0),
			tenantId,
			createdAt: now,
			updatedAt: now,
		});

		stock.addDomainEvent(
			new StockCreateEvent(id, productId, locationCode, initialQuantity),
		);
		return stock;
	}

	static restore(props: StockProps): Stock {
		return new Stock(props);
	}

	get id(): string {
		return this.props.id;
	}

	get productId(): string {
		return this.props.productId;
	}

	get locationName(): string {
		return this.props.location.getName();
	}

	get locationCode(): string {
		return this.props.location.getCode();
	}

	get locationType(): string {
		return this.props.location.getType();
	}

	get quantity(): number {
		return this.props.quantity.getValue();
	}

	get minimumQuantity(): number {
		return this.props.minimumQuantity.getValue();
	}

	get maximumQuantity(): number | undefined {
		return this.props.maximumQuantity?.getValue();
	}

	get reservedQuantity(): number {
		return this.props.reservedQuantity.getValue();
	}

	get availableQuantity(): number {
		return this.quantity - this.reservedQuantity;
	}

	get tenantId(): string {
		return this.props.tenantId;
	}

	get createdAt(): Date {
		return this.props.createdAt;
	}

	get updatedAt(): Date {
		return this.props.updatedAt;
	}

	increaseStock(quantity: number, userId: string): StockMovement {
		const addQty = Quantity.create(quantity);
		const previousQty = this.props.quantity;

		this.props.quantity = this.props.quantity.add(addQty);
		this.props.updatedAt = new Date();

		this.addDomainEvent(
			new StockIncreaseEvent(
				this.id,
				this.productId,
				quantity,
				this.locationCode,
			),
		);

		return StockMovement.create(
			crypto.randomUUID(),
			this.id,
			this.productId,
			"IN",
			"PURCHASE",
			quantity,
			previousQty.getValue(),
			this.props.quantity.getValue(),
			userId,
			this.tenantId,
		);
	}

	decreaseStock(
		quantity: number,
		userId: string,
		reason: MovementReasons = "SALE",
	): StockMovement {
		const subQty = Quantity.create(quantity);

		if (!this.hasAvailableQuantity(quantity)) {
			throw new Error("Insufficient quantity in stock");
		}

		const previousQty = this.props.quantity;
		this.props.quantity = this.props.quantity.subtract(subQty);
		this.props.updatedAt = new Date();

		this.addDomainEvent(
			new StockDecreaseEvent(
				this.id,
				this.productId,
				quantity,
				this.locationCode,
			),
		);

		if (this.isLowLevel()) {
			this.addDomainEvent(
				new StockLowLevelEvent(
					this.id,
					this.productId,
					this.quantity,
					this.minimumQuantity,
					this.locationCode,
				),
			);
		}

		return StockMovement.create(
			crypto.randomUUID(),
			this.id,
			this.productId,
			"OUT",
			reason,
			quantity,
			previousQty.getValue(),
			this.props.quantity.getValue(),
			userId,
			this.tenantId,
		);
	}

	adjustStock(
		newQuantity: number,
		userId: string,
		notes?: string,
	): StockMovement {
		const previousQty = this.props.quantity;
		const newQty = Quantity.create(newQuantity);

		this.props.quantity = newQty;
		this.props.updatedAt = new Date();

		const difference = newQuantity - previousQty.getValue();

		return StockMovement.create(
			crypto.randomUUID(),
			this.id,
			this.productId,
			"ADJUSTMENT",
			"ADJUSTMENT",
			Math.abs(difference),
			previousQty.getValue(),
			newQuantity,
			userId,
			this.tenantId,
			undefined,
			notes,
		);
	}

	reserveStock(quantity: number): void {
		const reserveQty = Quantity.create(quantity);

		if (!this.hasAvailableQuantity(quantity)) {
			throw new Error("Insufficient quantity in stock");
		}
		this.props.reservedQuantity = this.props.reservedQuantity.add(reserveQty);
		this.props.updatedAt = new Date();
	}

	releaseReservedStock(quantity: number): void {
		const releaseQty = Quantity.create(quantity);

		if (this.props.reservedQuantity.getValue() < quantity) {
			throw new Error("Insufficient reserved quantity");
		}

		this.props.reservedQuantity =
			this.props.reservedQuantity.subtract(releaseQty);
		this.props.updatedAt = new Date();
	}

	hasAvailableQuantity(quantity: number): boolean {
		return this.availableQuantity >= quantity;
	}

	isLowLevel(): boolean {
		return (
			this.props.quantity.getValue() <= this.props.minimumQuantity.getValue()
		);
	}

	isOverMaximum(): boolean {
		if (!this.props.maximumQuantity) return false;
		return this.props.quantity.isGreaterThan(this.props.maximumQuantity);
	}

	updateMinimumQuantity(quantity: number): void {
		this.props.minimumQuantity = Quantity.create(quantity);
		this.props.updatedAt = new Date();
	}

	updateMaximumQuantity(quantity: number): void {
		this.props.maximumQuantity = Quantity.create(quantity);
		this.props.updatedAt = new Date();
	}

	private addDomainEvent(event: DomainEvent): void {
		this.domainEvents.push(event);
	}

	getDomainEvents(): DomainEvent[] {
		return [...this.domainEvents];
	}

	clearDomainEvents(): void {
		this.domainEvents = [];
	}
}
