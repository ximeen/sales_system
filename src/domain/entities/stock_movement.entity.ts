import { Quantity } from "../value_objects/quantity.vo";

export type MovementType = "IN" | "OUT" | "ADJUSTMENT" | "TRANSFER";

export type MovementReasons =
	| "PURCHASE"
	| "SALE"
	| "RETURN"
	| "ADJUSTMENT"
	| "TRANSFER_IN"
	| "TRANSFER_OUT"
	| "LOSS"
	| "DAMAGED";

export interface StockMovementProps {
	id: string;
	stockId: string;
	productId: string;
	type: MovementType;
	reason: MovementReasons;
	quantity: Quantity;
	previousQuantity: Quantity;
	currentQuantity: Quantity;
	referenceId?: string;
	notes?: string;
	userId: string;
	tenantId: string;
	createdAt: Date;
}

export class StockMovement {
	private props: StockMovementProps;

	private constructor(props: StockMovementProps) {
		this.props = props;
	}

	static create(
		id: string,
		stockId: string,
		productId: string,
		type: MovementType,
		reason: MovementReasons,
		quantity: number,
		previousQuantity: number,
		currentQuantity: number,
		userId: string,
		tenantId: string,
		referenceId?: string,
		notes?: string,
	): StockMovement {
		return new StockMovement({
			id,
			stockId,
			productId,
			type,
			reason,
			quantity: Quantity.create(quantity),
			previousQuantity: Quantity.create(previousQuantity),
			currentQuantity: Quantity.create(currentQuantity),
			referenceId,
			notes,
			userId,
			tenantId,
			createdAt: new Date(),
		});
	}

	static restore(props: StockMovementProps): StockMovement {
		return new StockMovement(props);
	}
	get id(): string {
		return this.props.id;
	}

	get stockId(): string {
		return this.props.stockId;
	}

	get productId(): string {
		return this.props.productId;
	}

	get type(): MovementType {
		return this.props.type;
	}

	get reason(): MovementReasons {
		return this.props.reason;
	}

	get quantity(): number {
		return this.props.quantity.getValue();
	}

	get previousQuantity(): number {
		return this.props.previousQuantity.getValue();
	}

	get currentQuantity(): number {
		return this.props.currentQuantity.getValue();
	}

	get referenceId(): string | undefined {
		return this.props.referenceId;
	}

	get notes(): string | undefined {
		return this.props.notes;
	}

	get userId(): string {
		return this.props.userId;
	}

	get tenantId(): string {
		return this.props.tenantId;
	}

	get createdAt(): Date {
		return this.props.createdAt;
	}
}
