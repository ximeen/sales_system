import type { DomainEvent } from "../events/product.event";
import {
	SaleCancelledEvent,
	SaleConfirmedEvent,
	SaleCreatedEvent,
	SaleItemAddEvent,
	SaleItemRemovedEvent,
	SalePaidEvent,
} from "../events/sale.event";
import type { Discount } from "../value_objects/discount.vo";
import { Money } from "../value_objects/money.vo";
import { SaleItem } from "../value_objects/sale_item.vo";
import { Payment, type PaymentMethod } from "./payment.entity";

export type SaleStatus = "DRAFT" | "CONFIRMED" | "PAID" | "CANCELLED";

export interface SaleProps {
	id: string;
	customerId: string;
	customerName: string;
	items: SaleItem[];
	discount?: Discount;
	status: SaleStatus;
	payments: Payment[];
	subtotal: Money;
	discountAmount?: Money;
	total: Money;
	notes?: string;
	userId: string;
	tenantId: string;
	createdAt: Date;
	updatedAt: Date;
	confirmedAt?: Date;
	paidAt?: Date;
	cancelledAt?: Date;
	cancellationReason?: string;
}

export class Sale {
	private props: SaleProps;
	private domainEvents: DomainEvent[] = [];

	constructor(props: SaleProps) {
		this.props = props;
	}

	static create(
		id: string,
		customerId: string,
		customerName: string,
		userId: string,
		tenantId: string,
		notes?: string,
	): Sale {
		const now = new Date();
		const sale = new Sale({
			id,
			customerId,
			customerName,
			items: [],
			status: "DRAFT",
			payments: [],
			subtotal: Money.create(0),
			discountAmount: Money.create(0),
			total: Money.create(0),
			notes,
			userId,
			tenantId,
			createdAt: now,
			updatedAt: now,
		});

		sale.addDomainEvent(new SaleCreatedEvent(id, customerId, 0, 0));
		return sale;
	}

	static restore(props: SaleProps): Sale {
		return new Sale(props);
	}
	get id(): string {
		return this.props.id;
	}

	get customerId(): string {
		return this.props.customerId;
	}

	get customerName(): string {
		return this.props.customerName;
	}

	get items(): SaleItem[] {
		return [...this.props.items];
	}

	get itemsCount(): number {
		return this.props.items.length;
	}

	get discount(): Discount | undefined {
		return this.props.discount;
	}

	get status(): SaleStatus {
		return this.props.status;
	}

	get payments(): Payment[] {
		return [...this.props.payments];
	}

	get subtotal(): number {
		return this.props.subtotal.getAmount();
	}

	get discountAmount(): number | undefined {
		if (!this.props.discountAmount) return undefined;
		return this.props.discountAmount.getAmount();
	}

	get total(): number {
		return this.props.total.getAmount();
	}

	get totalPaid(): number {
		return this.props.payments
			.filter((p) => p.isConfirmed)
			.reduce((sum, p) => sum + p.amount, 0);
	}

	get remainingAmount(): number {
		return Math.max(0, this.total - this.totalPaid);
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

	get updatedAt(): Date {
		return this.props.updatedAt;
	}

	get confirmedAt(): Date | undefined {
		return this.props.confirmedAt;
	}

	get paidAt(): Date | undefined {
		return this.props.paidAt;
	}

	get cancelledAt(): Date | undefined {
		return this.props.cancelledAt;
	}

	get cancellationReason(): string | undefined {
		return this.props.cancellationReason;
	}

	get isDraft(): boolean {
		return this.props.status === "DRAFT";
	}

	get isConfirmed(): boolean {
		return this.props.status === "CONFIRMED";
	}

	get isPaid(): boolean {
		return this.props.status === "PAID";
	}

	get isCancelled(): boolean {
		return this.props.status === "CANCELLED";
	}

	get isFullyPaid(): boolean {
		return this.totalPaid >= this.total;
	}

	addItem(
		productId: string,
		productName: string,
		productSku: string,
		quantity: number,
		unitPrice: number,
		discout?: Discount,
	): void {
		if (!!this.isDraft) {
			throw new Error("It is possible to add items to draft sales");
		}

		const existingItem = this.props.items.find(
			(i) => i.productId === productId,
		);

		if (existingItem) {
			throw new Error(
				"Product alread exists in the sale. use the updateItemQuantity method",
			);
		}

		const item = SaleItem.create(
			crypto.randomUUID(),
			productId,
			productName,
			productSku,
			quantity,
			unitPrice,
			discout,
		);

		this.props.items.push(item);
		this.recalculateTotals();
		this.props.updatedAt = new Date();

		this.addDomainEvent(new SaleItemAddEvent(this.id, productId, quantity));
	}

	removeItem(itemId: string): void {
		if (!this.isDraft) {
			throw new Error("It is possible to remove items to draft sales");
		}

		const index = this.props.items.findIndex((i) => i.id === itemId);

		if (index === -1) {
			throw new Error("Item not found");
		}

		this.props.items.splice(index, 1);
		this.recalculateTotals();
		this.props.updatedAt = new Date();

		this.addDomainEvent(new SaleItemRemovedEvent(this.id, itemId));
	}

	updateItemQuantity(itemId: string, newQuantity: number): void {
		if (!this.isDraft) {
			throw new Error("It is possible to update items to draft sales");
		}

		const index = this.props.items.findIndex((i) => i.id === itemId);

		const item = this.props.items[index];
		if (!item) {
			throw new Error("Item not found");
		}

		this.props.items[index] = item.changeQuantity(newQuantity);

		this.recalculateTotals();
		this.props.updatedAt = new Date();
	}

	applyItemDiscount(itemId: string, discount: Discount): void {
		if (!this.isDraft) {
			throw new Error("It is possible to update items to draft sales");
		}

		const index = this.props.items.findIndex((i) => i.id === itemId);
		const item = this.props.items[index];
		if (!item) {
			throw new Error("Item not found");
		}

		this.props.items[index] = item.applyDiscount(discount);
		this.recalculateTotals();
		this.props.updatedAt = new Date();
	}

	applySaleDiscount(discount: Discount): void {
		if (!this.isDraft) {
			throw new Error("It is possible to update items to draft sales");
		}

		this.props.discount = discount;
		this.recalculateTotals();
		this.props.updatedAt = new Date();
	}

	removeSaleDiscount(): void {
		if (!this.isDraft) {
			throw new Error("It is possible to update items to draft sales");
		}

		this.props.discount = undefined;
		this.recalculateTotals();
		this.props.updatedAt = new Date();
	}

	confirm(): void {
		if (!this.isDraft) {
			throw new Error("It is possible to update items to draft sales");
		}
		if (this.props.items.length === 0) {
			throw new Error("Unable to confirm sale without items");
		}

		this.props.status = "CONFIRMED";
		this.props.confirmedAt = new Date();
		this.props.updatedAt = new Date();

		this.addDomainEvent(
			new SaleConfirmedEvent(this.id, this.customerId, this.total),
		);
	}

	addPayment(
		method: PaymentMethod,
		amount: number,
		transactionId: string,
		notes?: string,
	): Payment {
		if (this.isCancelled) {
			throw new Error("Its not a possible to add payment to a cancelled sale");
		}

		if (!this.isConfirmed && !this.isPaid) {
			throw new Error("Sale must be confirmed to receive payment");
		}

		if (amount <= 0) {
			throw new Error("Value payment must be greater than zero");
		}

		if (this.totalPaid + amount > this.total) {
			throw new Error("Total payments exceed the sales amount");
		}

		const payment = Payment.create(
			crypto.randomUUID(),
			method,
			amount,
			transactionId,
			notes,
		);
		payment.confirm();
		this.props.payments.push(payment);
		this.props.updatedAt = new Date();

		if (this.isFullyPaid) {
			this.props.status = "PAID";
			this.props.paidAt = new Date();

			this.addDomainEvent(new SalePaidEvent(this.id, this.totalPaid));
		}

		return payment;
	}

	cancel(reason?: string): void {
		if (this.isCancelled) {
			throw new Error("Sale already cancelled");
		}

		if (this.isPaid) {
			throw new Error(
				"Its not a possible cancel a sale that has already been paid for",
			);
		}

		if (this.props.payments.some((p) => p.isConfirmed)) {
			throw new Error(
				"Its not a possible to cancel a sale with confirmed payments",
			);
		}

		this.props.status = "CANCELLED";
		this.props.cancelledAt = new Date();
		this.props.cancellationReason = reason;
		this.props.updatedAt = new Date();

		this.addDomainEvent(new SaleCancelledEvent(this.id, reason));
	}

	private recalculateTotals(): void {
		const subtotalAmount = this.props.items.reduce(
			(sum, item) => sum + item.total,
			0,
		);
		this.props.subtotal = Money.create(subtotalAmount);

		let discountValue = 0;
		if (this.props.discount) {
			discountValue = this.props.discount.calculate(subtotalAmount);
		}
		this.props.discountAmount = Money.create(discountValue);
		this.props.total = Money.create(subtotalAmount - discountValue);
	}

	private addDomainEvent(event: DomainEvent): void {
		this.domainEvents.push(event);
	}
	getDomainsEvents(): DomainEvent[] {
		return [...this.domainEvents];
	}

	clearDomainEvents(): void {
		this.domainEvents = [];
	}
}
