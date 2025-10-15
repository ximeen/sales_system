import { Money } from "../value_objects/money.vo";

export type PaymentMethod =
	| "CASH"
	| "CREDIT_CARD"
	| "DEBIT_CARD"
	| "PIX"
	| "BANK_SLIP"
	| "CREDIT";

export type PaymentStatus = "PENDING" | "CONFIRMED" | "CANCELLED";

export interface PaymentProps {
	id: string;
	method: PaymentMethod;
	amount: Money;
	status: PaymentStatus;
	paidAt?: Date;
	transactionId?: string;
	notes?: string;
	createdAt: Date;
}

export class Payment {
	private props: PaymentProps;

	private constructor(props: PaymentProps) {
		this.props = props;
	}

	static create(
		id: string,
		method: PaymentMethod,
		amount: number,
		transactionId?: string,
		notes?: string,
	): Payment {
		return new Payment({
			id,
			method,
			amount: Money.create(amount),
			status: "PENDING",
			transactionId,
			notes,
			createdAt: new Date(),
		});
	}

	static restore(props: PaymentProps): Payment {
		return new Payment(props);
	}
	get id(): string {
		return this.props.id;
	}

	get method(): PaymentMethod {
		return this.props.method;
	}

	get amount(): number {
		return this.props.amount.getAmount();
	}

	get status(): PaymentStatus {
		return this.props.status;
	}

	get paidAt(): Date | undefined {
		return this.props.paidAt;
	}

	get transactionId(): string | undefined {
		return this.props.transactionId;
	}

	get notes(): string | undefined {
		return this.props.notes;
	}

	get createdAt(): Date {
		return this.props.createdAt;
	}

	get isPending(): boolean {
		return this.props.status === "PENDING";
	}

	get isConfirmed(): boolean {
		return this.props.status === "CONFIRMED";
	}

	get isCancelled(): boolean {
		return this.props.status === "CANCELLED";
	}

	confirm(): void {
		if (this.props.status === "CONFIRMED") {
			throw new Error("Payment has already been confirmed");
		}
		if (this.props.status === "CANCELLED") {
			throw new Error("It is not possible to confirm a cancelled payment");
		}

		this.props.status = "CONFIRMED";
		this.props.paidAt = new Date();
	}

	cancel(): void {
		if (this.props.status === "CANCELLED") {
			throw new Error("Payment has already been cancelled");
		}
		if (this.props.status === "CONFIRMED") {
			throw new Error("It is not possible to cancel a confirmed payment");
		}

		this.props.status = "CANCELLED";
	}
}
