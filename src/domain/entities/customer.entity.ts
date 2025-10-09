import {
	CustomerActivatedEvent,
	CustomerCreatedEvent,
	CustomerDesactivatedEvent,
	CustomerUpdatedEvent,
} from "../events/customer.event";
import type { DomainEvent } from "../events/product.event";
import type { Address } from "../value_objects/address.vo";
import { Document } from "../value_objects/document.vo";
import { Email } from "../value_objects/email.vo";
import { Phone } from "../value_objects/phone.vo";

export type CustomerType = "INDIVIDUAL" | "BUSINESS";

export interface CustomerProps {
	id: string;
	name: string;
	email: Email;
	phone: Phone;
	document: Document;
	type: CustomerType;
	address?: Address;
	secondaryPhone?: Phone;
	notes?: string;
	isActive: boolean;
	creditLimit?: number;
	currentDebt: number;
	tenantId: string;
	createdAt: Date;
	updatedAt: Date;
}

export class Customer {
	private props: CustomerProps;
	private domainEvents: DomainEvent[] = [];

	private constructor(props: CustomerProps) {
		this.props = props;
	}

	static create(
		id: string,
		name: string,
		email: string,
		phone: string,
		document: string,
		tenantId: string,
		address?: Address,
		secondaryPhone?: string,
		notes?: string,
		creditLimit?: number,
	): Customer {
		const customerEmail = Email.create(email);
		const customerPhone = Phone.create(phone);
		const customerDocument = Document.create(document);
		const type: CustomerType =
			customerDocument.getType() === "CPF" ? "INDIVIDUAL" : "BUSINESS";
		const now = new Date();

		const customer = new Customer({
			id,
			name: name.trim(),
			email: customerEmail,
			phone: customerPhone,
			document: customerDocument,
			type,
			address,
			secondaryPhone: secondaryPhone ? Phone.create(secondaryPhone) : undefined,
			notes,
			isActive: true,
			creditLimit,
			currentDebt: 0,
			tenantId,
			createdAt: now,
			updatedAt: now,
		});

		customer.addDomainEvents(
			new CustomerCreatedEvent(id, name, email, document),
		);

		return customer;
	}

	static restore(props: CustomerProps): Customer {
		return new Customer(props);
	}
	get id(): string {
		return this.props.id;
	}

	get name(): string {
		return this.props.name;
	}

	get email(): string {
		return this.props.email.getValue();
	}

	get phone(): string {
		return this.props.phone.getValue();
	}

	get phoneFormatted(): string {
		return this.props.phone.getFormatted();
	}

	get document(): string {
		return this.props.document.getValue();
	}

	get documentFormatted(): string {
		return this.props.document.getFormatted();
	}

	get documentType(): string {
		return this.props.document.getType();
	}

	get type(): CustomerType {
		return this.props.type;
	}

	get address(): Address | undefined {
		return this.props.address;
	}

	get secondaryPhone(): string | undefined {
		return this.props.secondaryPhone?.getValue();
	}

	get notes(): string | undefined {
		return this.props.notes;
	}

	get isActive(): boolean {
		return this.props.isActive;
	}

	get creditLimit(): number | undefined {
		return this.props.creditLimit;
	}

	get currentDebt(): number {
		return this.props.currentDebt;
	}

	get availableCredit(): number | null {
		if (!this.props.creditLimit) return null;
		return this.props.creditLimit - this.props.currentDebt;
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

	updateInfo(
		name?: string,
		email?: string,
		phone?: string,
		secondaryPhone?: string,
		notes?: string,
	): void {
		const changes: Record<string, any> = {};
		if (name && name !== this.props.name) {
			this.props.name = name;
			changes.name = name;
		}
		if (email && email !== this.email) {
			this.props.email = Email.create(email);
			changes.email = email;
		}

		if (phone && phone !== this.phone) {
			this.props.phone = Phone.create(phone);
			changes.phone = phone;
		}

		if (secondaryPhone !== undefined) {
			this.props.secondaryPhone = secondaryPhone
				? Phone.create(secondaryPhone)
				: undefined;
			changes.secondaryPhone = secondaryPhone;
		}

		if (notes !== undefined) {
			this.props.notes = notes;
			changes.notes = notes;
		}

		if (Object.keys(changes).length > 0) {
			this.props.updatedAt;
			this.addDomainEvents(new CustomerUpdatedEvent(this.id, changes));
		}
	}

	updateAddress(address: Address): void {
		this.props.address = address;
		this.props.updatedAt = new Date();

		this.addDomainEvents(
			new CustomerUpdatedEvent(this.id, { address: "update" }),
		);
	}

	updateCreditLimit(creditLimit?: number): void {
		if (creditLimit !== undefined && creditLimit < 0) {
			throw new Error("Credit limit cannot be negative");
		}
		if (creditLimit !== undefined && creditLimit < this.props.currentDebt) {
			throw new Error("Credit limit cannot be less than current debt");
		}

		this.props.creditLimit = creditLimit;
		this.props.updatedAt = new Date();
	}

	increseDbt(amount: number): void {
		if (amount < 0) {
			throw new Error("Amount must be greater than zero");
		}

		const newDebit = this.props.currentDebt + amount;

		if (this.props.creditLimit && newDebit > this.props.creditLimit) {
			throw new Error("Credit limit exceeded");
		}

		this.props.currentDebt = newDebit;
		this.props.updatedAt = new Date();
	}

	decreaseDbt(amount: number): void {
		if (amount <= 0) {
			throw new Error("Amount must be greater than zero");
		}
		if (amount > this.props.currentDebt) {
			throw new Error("Value greater than the current debit");
		}

		this.props.currentDebt -= amount;
		this.props.updatedAt = new Date();
	}

	hasAvailableCredit(amount: number): boolean {
		if (!this.props.creditLimit) return false;
		const available = this.availableCredit;

		return available !== null && available >= amount;
	}

	activate(): void {
		if (this.props.isActive) {
			throw new Error("Client already activated");
		}

		this.props.isActive = true;
		this.props.updatedAt = new Date();

		this.addDomainEvents(new CustomerActivatedEvent(this.id));
	}

	desactivate(): void {
		if (!this.props.isActive) {
			throw new Error("Client already desactivated");
		}

		if (this.props.currentDebt > 0) {
			throw new Error(
				"It is not possible to desactivated a customer with outstanding debits",
			);
		}

		this.props.isActive = false;
		this.props.updatedAt = new Date();
		this.addDomainEvents(new CustomerDesactivatedEvent(this.id));
	}

	private addDomainEvents(event: DomainEvent): void {
		this.domainEvents.push(event);
	}

	getDomainsEvents(): DomainEvent[] {
		return [...this.domainEvents];
	}

	clearDomainEvents(): void {
		this.domainEvents = [];
	}
}
